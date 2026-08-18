import React from 'react';
import { Mic, AlertTriangle, RefreshCw, Settings } from 'lucide-react';

export function PermissionModal({ permissionStatus, onRequestPermission }) {
  if (permissionStatus === 'granted') {
    return null; // Don't show anything if permission is already granted
  }

  return (
    <div
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '10px',
        border: permissionStatus === 'denied' ? '1px solid #fecaca' : '1px solid #fed7aa',
        backgroundColor: permissionStatus === 'denied' ? '#fef2f2' : '#fffbeb',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        {permissionStatus === 'denied' ? (
          <AlertTriangle color="#dc2626" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <Mic color="#d97706" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        )}

        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#111827' }}>
            {permissionStatus === 'denied'
              ? 'Microphone Access Blocked'
              : 'Microphone Permission Required'}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
            {permissionStatus === 'denied' ? (
              <>
                Microphone access was blocked in your browser settings. To enable voice billing,
                click the <strong>site settings icon</strong> (tune/padlock icon next to the URL in your address bar) and toggle <strong>Microphone</strong> to <strong>Allow</strong>, then refresh the page.
              </>
            ) : (
              'This application requires microphone access with background noise cancellation to parse your voice into bills.'
            )}
          </p>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {permissionStatus === 'denied' ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Refresh Page
          </button>
        ) : (
          <button
            type="button"
            onClick={onRequestPermission}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Mic size={14} /> Enable Microphone
          </button>
        )}
      </div>
    </div>
  );
}