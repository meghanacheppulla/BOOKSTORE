import { useState, useRef } from 'react';
import Papa from 'papaparse';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function BulkUploadCSV({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data;
          const formattedData = rawData.map((row) => ({
            title: row.title?.trim(),
            author: row.author?.trim(),
            description: row.description?.trim(),
            price: Number(row.price),
            genre: row.genre?.trim(),
            stock: Number(row.stock),
            imageUrl: row.imageUrl?.trim(),
          }));

          const response = await api.post('/books/bulk', formattedData);
          addToast(`${response.data.data.count} books successfully imported!`, 'success');
          if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
          addToast(error.response?.data?.message || error.message || 'Bulk upload failed', 'error');
        } finally {
          setUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        addToast(`CSV Parsing Error: ${error.message}`, 'error');
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bulk-upload-dropzone" onClick={handleDropAreaClick}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
        disabled={uploading}
      />
      <div className="dropzone-content">
        <span className="dropzone-icon">📁</span>
        <span className="dropzone-text">
          {uploading ? 'Processing CSV...' : 'Bulk Upload (CSV) - Click to browse'}
        </span>
      </div>
    </div>
  );
}
