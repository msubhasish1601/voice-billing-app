import React from 'react';
import { Edit, Trash2, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataGrid({ 
  data, columns, onEdit, onDelete,
  total, page, limit, onPageChange, onLimitChange,
  searchValue, onSearch, sortConfig, onSort 
}) {
  
  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      
      {/* Search Toolbar */}
      <div style={{ padding: '16px 50px 16px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
          Total Records: {total}
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search Name or Address..."
            value={searchValue}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '8px 8px 8px 34px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: '#f8fafc', color: '#475569' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable !== false && onSort(col.field)}
                  style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.headerName}
                    {col.sortable !== false && (
                      sortConfig.key === col.field ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#2563eb" /> : <ArrowDown size={14} color="#2563eb" />
                      ) : (
                        <ArrowUpDown size={14} color="#cbd5e1" />
                      )
                    )}
                  </div>
                </th>
              ))}
              <th style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {columns.map((col) => (
                    <td key={col.field} style={{ padding: '12px 16px', color: '#334155' }}>
                      {col.valueFormatter ? col.valueFormatter(row[col.field]) : row[col.field]}
                    </td>
                  ))}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => onEdit(row.id)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '12px' }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => onDelete(row.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
          <span>Rows per page:</span>
          <select 
            value={limit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
          >
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => onPageChange(page - 1)} 
              disabled={page <= 1}
              style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: page <= 1 ? '#f1f5f9' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} color={page <= 1 ? '#94a3b8' : '#334155'} />
            </button>
            <button 
              onClick={() => onPageChange(page + 1)} 
              disabled={page >= totalPages}
              style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: page >= totalPages ? '#f1f5f9' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} color={page >= totalPages ? '#94a3b8' : '#334155'} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}