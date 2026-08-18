import React from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

export function VoiceInputButton({ 
  isListening, 
  isProcessing, 
  statusMessage, 
  transcript, 
  onStart, 
  onStop 
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={onStart}
          onTouchEnd={onStop}
          disabled={isProcessing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: isListening ? '#ef4444' : isProcessing ? '#6b7280' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            userSelect: 'none',
            transform: isListening ? 'scale(0.98)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
          }}
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin" size={18} /> Processing...</>
          ) : isListening ? (
            <><MicOff size={18} /> Release to Process</>
          ) : (
            <><Mic size={18} /> Hold to Speak</>
          )}
        </button>
      </div>

      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '500' }}>
          <Sparkles size={16} color="#2563eb" /> {statusMessage}
        </div>
        {transcript && (
          <div style={{ marginTop: '4px', color: '#64748b', fontStyle: 'italic' }}>
            Transcribed: "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
}