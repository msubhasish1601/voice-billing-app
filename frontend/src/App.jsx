import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Save, CheckCircle2 } from 'lucide-react';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { VoiceInputButton } from './components/VoiceInputButton';
import { DynamicBillingTable } from './components/DynamicBillingTable';
import { PermissionModal } from './components/PermissionModal';
import { VoiceHints } from './components/VoiceHints'; // <-- Import component

export default function App() {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const stateRef = useRef({ customerName, address, items });
  stateRef.current = { customerName, address, items };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const {
    isListening,
    isProcessing,
    statusMessage,
    transcript,
    permissionStatus,
    requestMicrophonePermission,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    apiEndpoint: `${API_BASE_URL}/api/parse-bill`,
    getCurrentBillState: () => ({
      customer_name: stateRef.current.customerName,
      address: stateRef.current.address,
      items: stateRef.current.items,
    }),
    onDataReceived: (data) => {
      if (data.customer_name) setCustomerName(data.customer_name);
      if (data.address) setAddress(data.address);
      if (data.items) setItems(data.items);
    },
  });

  const handleSaveBill = async () => {
    if (!customerName || items.length === 0) {
      alert('Please provide a customer name and at least one item before saving.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/save-bill`, {
        customer_name: customerName,
        address: address,
        items: items,
      });

      setSaveSuccess(`Invoice #${response.data.bill_id} saved to PostgreSQL!`);
    } catch (err) {
      console.error('Error saving bill:', err);
      alert('Failed to save bill to database. Check backend logs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <h1 style={{ margin: '0 0 16px', fontSize: '22px', color: '#111827' }}>Voice Billing Dashboard</h1>

      {/* Permission Prompter */}
      <PermissionModal
        permissionStatus={permissionStatus}
        onRequestPermission={requestMicrophonePermission}
      />

      {/* Voice Trigger Component */}
      <VoiceInputButton
        isListening={isListening}
        isProcessing={isProcessing}
        statusMessage={statusMessage}
        transcript={transcript}
        onStart={startListening}
        onStop={stopListening}
      />

      {/* Customer Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Customer Name</label>
          <input
            type="text"
            placeholder="e.g. Amrinder Singh"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Billing Address</label>
          <input
            type="text"
            placeholder="e.g. 45 Orchid Lane"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <DynamicBillingTable items={items} onChange={setItems} />

      {/* Save Button */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {saveSuccess && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '14px', fontWeight: '500' }}>
            <CheckCircle2 size={16} /> {saveSuccess}
          </span>
        )}
        {/* <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={handleSaveBill}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div> */}
      </div>

      {/* Voice Hints Section at Bottom */}
      <VoiceHints />
    </div>
  );
}