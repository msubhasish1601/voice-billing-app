import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

export function VoiceInputButton({ 
  isListening, 
  isProcessing, 
  statusMessage, 
  transcript, 
  onStart, 
  onStop 
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <button
        // --- Desktop Events ---
        onMouseDown={onStart}
        onMouseUp={onStop}
        onMouseLeave={onStop}
        
        // --- Mobile Touch Events ---
        onTouchStart={(e) => {
          e.preventDefault(); // Prevents double-firing with mouse events
          onStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onStop();
        }}
        
        disabled={isProcessing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: isListening ? '#ef4444' : '#2563eb', // Red when listening, Blue normally
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          width: '100%',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
          
          // --- Mobile CSS Fixes: Prevents long-press context menus ---
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'none' // Prevents scrolling while holding the button
        }}
      >
        {isProcessing ? (
          <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Mic size={20} />
        )}
        {isProcessing ? 'Processing AI...' : isListening ? 'Listening... Release to send' : 'Hold to Speak'}
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