import React, { useState } from 'react';
import { Plus, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { BillList } from './components/BillList';
import { BillForm } from './components/BillForm';

export default function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'form'
  const [editingBillId, setEditingBillId] = useState(null);
  
  // Toast State: { message: string, type: 'success' | 'error' } | null
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto-hide after 3 seconds
  };

  const openNewBillForm = () => {
    setEditingBillId(null);
    setCurrentView('form');
  };

  const handleEdit = (id) => {
    setEditingBillId(id);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingBillId(null);
  };

  const handleSaveSuccess = (message) => {
    setCurrentView('list');
    setEditingBillId(null);
    showToast(message, 'success');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative' }}>
      
      {/* --- Custom Toast Notification --- */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontWeight: '500',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>
          {currentView === 'list' 
            ? 'AI Voice Invoice Database' 
            : editingBillId ? `Edit Invoice #${editingBillId}` : 'New Voice Invoice'}
        </h1>
        
        {currentView === 'list' ? (
          <button onClick={openNewBillForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <Plus size={18} /> Add New Bill
          </button>
        ) : (
          <button onClick={handleBackToList} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <ArrowLeft size={16} /> Back to List
          </button>
        )}
      </div>

      {/* View Router */}
      {currentView === 'list' ? (
        <BillList onEdit={handleEdit} />
      ) : (
        <BillForm 
          editingBillId={editingBillId} 
          onSaveSuccess={handleSaveSuccess} 
        />
      )}
    </div>
  );
}