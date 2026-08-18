import React from 'react';
import { HelpCircle, PlusCircle, Edit3, UserCheck } from 'lucide-react';

export function VoiceHints() {
  const hintCategories = [
    {
      title: "Initial Invoice Creation",
      icon: <UserCheck size={16} color="#2563eb" />,
      examples: [
        '"Bill for Robert Fox, 45 Orchid Lane, 2 notebooks at 3.50 each and 1 desk lamp at 25"',
        '"Create invoice for John Doe, 12 Baker Street, 5 pens at 2 dollars and 1 bag at 40"'
      ]
    },
    {
      title: "Add Items (Incremental)",
      icon: <PlusCircle size={16} color="#16a34a" />,
      examples: [
        '"Also add 3 whiteboard markers at 4 each"',
        '"Add two bottles of hand sanitizer at 6.50 and one box of staples at 3"'
      ]
    },
    {
      title: "Edit / Update Existing Data",
      icon: <Edit3 size={16} color="#d97706" />,
      examples: [
        '"Change notebook quantity to 5"',
        '"Update desk lamp price to 30"',
        '"Update customer name to Amrinder Singh"'
      ]
    }
  ];

  return (
    <div style={{
      marginTop: '32px',
      padding: '16px 20px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <HelpCircle size={18} color="#475569" />
        <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
          Voice Command Examples & Hints
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {hintCategories.map((cat, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #edf2f7'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
              {cat.icon}
              <span>{cat.title}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
              {cat.examples.map((example, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>
                  {example}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}