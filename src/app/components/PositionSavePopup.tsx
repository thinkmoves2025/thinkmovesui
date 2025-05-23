'use client';

import React, { useState } from 'react';

interface PositionSavePopupProps {
  onClose: () => void;
  onSave: (positionName: string, notes: string) => void;
  fen: string;
}

export default function PositionSavePopup({ onClose, onSave, fen }: PositionSavePopupProps) {
  const [positionName, setPositionName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionName.trim()) {
      setError('Please enter a position name');
      return;
    }
    onSave(positionName, notes);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h2>Save Position</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Position Name</label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>FEN</label>
            <input
              type="text"
              value={fen}
              readOnly
              style={{ width: '100%', padding: '8px', marginBottom: '1rem', backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="submit"
              style={{
                padding: '12px 16px',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 16px',
                backgroundColor: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
