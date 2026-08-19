import React from 'react';
import { Info, Smartphone, Monitor } from 'lucide-react';

export function VoiceHints() {
  return (
    <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
      <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={18} color="#2563eb" />
        Voice Command Best Practices
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Mobile Instructions Card */}
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={16} />
            Mobile Phone Users
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
            Mobile browsers have strict microphone timeouts. To prevent the audio from cutting off, <strong>speak one detail at a time:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '4px' }}>Tap speak, say <em>"Customer Raghav Singh"</em>, tap Stop.</li>
              <li style={{ marginBottom: '4px' }}>Tap speak, say <em>"Address BMC Hospital"</em>, tap Stop.</li>
              <li>Tap speak, say <em>"20 bananas at 5 dollars"</em>, tap Stop.</li>
            </ul>
          </p>
        </div>

        {/* Desktop Instructions Card */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce3', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Monitor size={16} />
            Desktop / Laptop Users
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
            Desktop browsers do not timeout. You can speak the entire invoice in one continuous sentence:
            <br /><br />
            <em>"Create a bill for Robert Fox at 45 Orchid Lane. Add 2 notebooks at 3.50 each and 1 desk lamp at 25 dollars."</em>
          </p>
        </div>

      </div>
    </div>
  );
}