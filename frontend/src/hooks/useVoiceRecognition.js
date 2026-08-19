import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export function useVoiceRecognition({ apiEndpoint, getCurrentBillState, onDataReceived }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  const recognitionRef = useRef(null);
  const transcriptRef = useRef(''); 
  
  // NEW: Tracks if the user tapped stop, or if Android auto-stopped
  const isManualStopRef = useRef(false); 

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
    } catch (err) {
      setPermissionStatus('denied');
    }
  };

  // Helper function to send the data to FastAPI
  const processVoiceCommand = async (finalSpeech) => {
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
  };

  const startListening = useCallback(() => {
    setStatusMessage('');
    setTranscript('');
    transcriptRef.current = '';
    isManualStopRef.current = false; // Reset the tracker

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
    };

    recognition.onresult = (event) => {
      let cleanTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript.trim();
        if (!chunk) continue;

        if (cleanTranscript && chunk.toLowerCase().includes(cleanTranscript.toLowerCase())) {
          cleanTranscript = chunk;
        } 
        else if (cleanTranscript && cleanTranscript.toLowerCase().includes(chunk.toLowerCase())) {
          continue; 
        } 
        else {
          cleanTranscript += (cleanTranscript ? ' ' : '') + chunk;
        }
      }
      
      transcriptRef.current = cleanTranscript;
      setTranscript(cleanTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      // Ignore 'no-speech' errors as they just mean silence was detected
      if (event.error !== 'no-speech') {
        setStatusMessage(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // NEW: If Android auto-stopped due to silence, process the text automatically!
      if (!isManualStopRef.current) {
        if (transcriptRef.current.trim()) {
          processVoiceCommand(transcriptRef.current.trim());
        } else {
          setStatusMessage('Listening timed out. Tap to try again.');
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  const stopListening = useCallback(() => {
    isManualStopRef.current = true; // Mark that you manually stopped it
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    // Process whatever was captured
    processVoiceCommand(transcriptRef.current.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  return {
    isListening, isProcessing, statusMessage, transcript, permissionStatus,
    requestMicrophonePermission, startListening, stopListening
  };
}