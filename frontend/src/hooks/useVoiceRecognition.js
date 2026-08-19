import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export function useVoiceRecognition({ apiEndpoint, getCurrentBillState, onDataReceived }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // We use a ref to constantly track the text as it streams in, 
  // bypassing Android's broken final onresult flush.
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(''); 

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
    } catch (err) {
      setPermissionStatus('denied');
    }
  };

  const startListening = useCallback(() => {
    setStatusMessage('');
    setTranscript('');
    transcriptRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    
    // CRITICAL FOR ANDROID: Must be true to stream text continuously
    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
    };

// This fires continuously as you speak
    recognition.onresult = (event) => {
      let cleanTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript.trim();
        if (!chunk) continue;

        // 1. Android Bug Fix: If the new chunk already contains our existing text, overwrite it.
        if (cleanTranscript && chunk.toLowerCase().includes(cleanTranscript.toLowerCase())) {
          cleanTranscript = chunk;
        } 
        // 2. Failsafe: If our existing text already contains the new chunk, ignore the duplicate.
        else if (cleanTranscript && cleanTranscript.toLowerCase().includes(chunk.toLowerCase())) {
          continue; 
        } 
        // 3. Desktop Behavior: Append discrete new chunks safely.
        else {
          cleanTranscript += (cleanTranscript ? ' ' : '') + chunk;
        }
      }
      
      // Save the cleaned text to both the UI state and the background Ref
      transcriptRef.current = cleanTranscript;
      setTranscript(cleanTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      setStatusMessage(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Stops the mic
    }
    setIsListening(false);

    // Grab the text from the Ref, NOT the state, to avoid React batching delays
    const finalSpeech = transcriptRef.current.trim();

    // Update your error message to reflect the new Toggle mechanic
    if (!finalSpeech) {
      setStatusMessage('No speech detected. Please try again.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Processing voice command...');

    try {
      const res = await axios.post(apiEndpoint, {
        transcript: finalSpeech,
        current_bill: getCurrentBillState ? getCurrentBillState() : null
      });
      onDataReceived(res.data);
      setStatusMessage('Success!');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to parse bill. Check backend.');
    } finally {
      setIsProcessing(false);
      setTranscript('');
      transcriptRef.current = '';
    }
  }, [apiEndpoint, getCurrentBillState, onDataReceived]);

  return {
    isListening, isProcessing, statusMessage, transcript, permissionStatus,
    requestMicrophonePermission, startListening, stopListening
  };
}