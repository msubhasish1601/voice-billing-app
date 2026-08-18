import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from './DataGrid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function BillList({ onEdit }) {
  const [billsData, setBillsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Server-Side State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const fetchBills = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page,
        limit: limit,
        search: search,
        sort_by: sortConfig.key,
        sort_desc: sortConfig.direction === 'desc'
      });

      const res = await axios.get(`${API_BASE_URL}/api/bills?${params.toString()}`);
      setBillsData(res.data.data);
      setTotalRecords(res.data.total);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
  }, [page, limit, search, sortConfig]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bills/${id}`);
        fetchBills(); 
      } catch (err) {
        alert("Failed to delete bill.");
      }
    }
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page on new search
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
    setPage(1); // Reset to first page on sort
  };

  const gridColumns = [
    { field: 'id', headerName: 'Invoice #', sortable: true },
    { field: 'customer_name', headerName: 'Customer Name', sortable: true },
    { field: 'address', headerName: 'Address', sortable: true },
    { 
      field: 'grand_total', 
      headerName: 'Total', 
      sortable: true,
      valueFormatter: (val) => `$${parseFloat(val).toFixed(2)}`
    },
    { 
      field: 'created_at', 
      headerName: 'Date Created', 
      sortable: true,
      valueFormatter: (val) => new Date(val).toLocaleDateString()
    },
  ];

  return (
    <DataGrid 
      data={billsData} 
      columns={gridColumns} 
      onEdit={onEdit} 
      onDelete={handleDelete}
      // Server-side props
      total={totalRecords}
      page={page}
      limit={limit}
      onPageChange={setPage}
      onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      searchValue={search}
      onSearch={handleSearch}
      sortConfig={sortConfig}
      onSort={handleSort}
    />
  );
}