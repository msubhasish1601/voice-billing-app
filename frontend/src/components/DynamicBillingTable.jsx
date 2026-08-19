import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function DynamicBillingTable({ items = [], onChange }) {
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'item_name' ? value : Number(value) || 0;
    onChange(updated);
  };

  const addItemRow = () => {
    onChange([...items, { item_name: '', quantity: 1, price: 0 }]);
  };

  const removeItemRow = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '13px', color: '#4b5563' }}>
            <th style={{ padding: '10px' }}>Item Description</th>
            <th style={{ padding: '10px', width: '100px' }}>Qty</th>
            <th style={{ padding: '10px', width: '130px' }}>Unit Price ($)</th>
            <th style={{ padding: '10px', width: '130px', textAlign: 'right' }}>Total ($)</th>
            <th style={{ padding: '10px', width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  value={item.item_name}
                  onChange={(e) => updateItem(idx, 'item_name', e.target.value)}
                  placeholder="Item name"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>
                {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No items added. Speak or click below to add a row.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={addItemRow}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '13px',whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Plus size={15} /> Add Item Row
        </button>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
          Grand Total: ${grandTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}