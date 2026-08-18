import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export function useVoiceRecognition({ apiEndpoint, onDataReceived, getCurrentBillState }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Hold the button to speak, release to process.');
  const [transcript, setTranscript] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'

  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');
  const mediaStreamRef = useRef(null);

  // 1. Check current microphone permission status on mount
  useEffect(() => {
    async function checkPermission() {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' });
          setPermissionStatus(result.state);

          result.onchange = () => {
            setPermissionStatus(result.state);
          };
        } catch (err) {
          console.warn('Permissions API query for microphone not supported:', err);
        }
      }
    }
    checkPermission();
  }, []);

  // 2. Explicit Permission Requester
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
      // Permission granted
      setPermissionStatus('granted');
      // Release test stream tracks immediately
      stream.getTracks().forEach((track) => track.stop());
      setStatusMessage('Microphone access granted. Ready to speak.');
      return true;
    } catch (err) {
      console.error('Microphone permission request error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setStatusMessage('Microphone access denied. Please allow microphone permissions.');
      }
      return false;
    }
  }, []);

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // 3. Start Recording Handler
  const startListening = useCallback(async () => {
    if (isListening || isProcessing) return;

    // Check hardware permission before attempting recognition
    if (permissionStatus === 'denied') {
      alert('Microphone access is blocked in your browser settings. Please allow it in the address bar.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        setPermissionStatus('granted');
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    accumulatedTextRef.current = '';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening (Noise suppression active)...');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript + ' ';
      }
      accumulatedTextRef.current = finalTranscript.trim();
      setTranscript(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      cleanupMediaStream();

      if (event.error === 'not-allowed') {
        setPermissionStatus('denied');
        setStatusMessage('Microphone access not allowed. Please allow permission.');
      } else {
        setStatusMessage(`Voice error: ${event.error}. Please try again.`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, isProcessing, permissionStatus]);

  // 4. Stop Recording Handler
  const stopListening = useCallback(async () => {
    if (!recognitionRef.current || !isListening) return;

    recognitionRef.current.stop();
    cleanupMediaStream();
    setIsListening(false);

    const fullTranscript = accumulatedTextRef.current;
    if (!fullTranscript) {
      setStatusMessage('No speech detected. Try holding the button longer.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Denoising & parsing with Gemini...');

    try {
      const currentBill = getCurrentBillState ? getCurrentBillState() : null;

      const response = await axios.post(apiEndpoint, {
        transcript: fullTranscript,
        current_bill: currentBill,
      });

      if (onDataReceived) {
        onDataReceived(response.data);
      }
      setStatusMessage('Bill updated successfully!');
    } catch (err) {
      console.error('Error sending transcript to backend:', err);
      setStatusMessage('Failed to update bill. Check backend connection.');
    } finally {
      setIsProcessing(false);
    }
  }, [apiEndpoint, isListening, onDataReceived, getCurrentBillState]);

  return {
    isListening,
    isProcessing,
    statusMessage,
    transcript,
    permissionStatus,
    requestMicrophonePermission,
    startListening,
    stopListening,
  };
}