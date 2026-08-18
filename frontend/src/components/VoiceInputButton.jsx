import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export function VoiceInputButton({ 
  isListening, 
  isProcessing, 
  statusMessage, 
  transcript, 
  onStart, 
  onStop 
}) {

  const handleToggle = (e) => {
    e.preventDefault(); // Safe to use here inside onClick
    if (isProcessing) return;
    
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 24px', // Slightly taller for easier mobile tapping
          backgroundColor: isListening ? '#ef4444' : '#2563eb', // Red when recording
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          width: '100%',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
          
          // Mobile optimizations
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation' // Optimizes tap delay on mobile devices
        }}
      >
        {isProcessing ? (
          <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : isListening ? (
          <Square size={18} fill="currentColor" /> // Stop icon
        ) : (
          <Mic size={20} />
        )}
        
        {isProcessing 
          ? 'Processing AI...' 
          : isListening 
            ? 'Listening... Tap to Stop' 
            : 'Tap to Speak'}
      </button>

      {/* Status & Transcript Display */}
      {(statusMessage || transcript) && (
        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {statusMessage && (
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: isListening ? '#2563eb' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>✨</span> {statusMessage}
            </p>
          )}
          {transcript && (
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
              "{transcript}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}