import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { VoiceInputButton } from './VoiceInputButton';
import { DynamicBillingTable } from './DynamicBillingTable';
import { PermissionModal } from './PermissionModal';
import { VoiceHints } from './VoiceHints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function BillForm({ editingBillId, onSaveSuccess }) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentBillId, setCurrentBillId] = useState(editingBillId);

  const stateRef = useRef({ customerName, address, items });
  stateRef.current = { customerName, address, items };

  // Fetch existing bill data if in edit mode
  useEffect(() => {
    if (currentBillId) {
      axios.get(`${API_BASE_URL}/api/bills/${currentBillId}`)
        .then(res => {
          const bill = res.data;
          setCustomerName(bill.customer_name);
          setAddress(bill.address);
          setItems(bill.items);
        })
        .catch(err => {
          console.error(err);
          setErrorMessage("Failed to load existing bill data.");
        });
    }
  }, [currentBillId]);

  const {
    isListening, isProcessing, statusMessage, transcript, permissionStatus,
    requestMicrophonePermission, startListening, stopListening,
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
      setErrorMessage('Please provide a customer name and at least one item before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const payload = { customer_name: customerName, address: address, items: items };
      
      if (currentBillId) {
        await axios.put(`${API_BASE_URL}/api/save-bill/${currentBillId}`, payload);
        onSaveSuccess(`Invoice #${currentBillId} updated successfully!`);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/save-bill`, payload);
        onSaveSuccess(`Invoice #${response.data.bill_id} saved successfully!`);
      }
    } catch (err) {
      console.error('Error saving bill:', err);
      // Extract exact error detail from FastAPI if available
      const detail = err.response?.data?.detail || "Check backend connection.";
      setErrorMessage(`Failed to save: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PermissionModal permissionStatus={permissionStatus} onRequestPermission={requestMicrophonePermission} />
      
      <VoiceInputButton isListening={isListening} isProcessing={isProcessing} statusMessage={statusMessage} transcript={transcript} onStart={startListening} onStop={stopListening} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Customer Name</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Billing Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
        </div>
      </div>

      <DynamicBillingTable items={items} onChange={setItems} />

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Local Error Display */}
        <div style={{ flex: 1 }}>
          {errorMessage && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '14px', fontWeight: '500', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <AlertTriangle size={16} /> {errorMessage}
            </span>
          )}
        </div>
        
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={handleSaveBill} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : currentBillId ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>
      
      <VoiceHints />
    </div>
  );
}