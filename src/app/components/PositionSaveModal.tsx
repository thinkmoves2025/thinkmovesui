'use client';

import { useState } from 'react';

interface PositionSaveModalProps {
  onClose: () => void;
  currentFEN: string;
  whosTurn: string;
  onSave: (name: string, notes: string, whosTurn: string) => Promise<void>;
}

export default function PositionSaveModal({
  onClose,
  whosTurn,
  onSave,
  currentFEN,
}: PositionSaveModalProps) {
  const [positionName, setPositionName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleClick = () => {
    if (!positionName) {
      setError('Please enter a position name.');
      return;
    }

    onSave(positionName, notes, whosTurn); // pass whosTurn from props
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
        width: '400px',
        margin: '100px auto',
      }}
    >
      <h2>Save Position</h2>

      <input
        placeholder="Position Name"
        value={positionName}
        onChange={(e) => setPositionName(e.target.value)}
        style={{ marginBottom: '0.5rem', width: '100%' }}
      />
      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ marginBottom: '0.5rem', width: '100%' }}
      />

      <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        <strong>Turn:</strong> {whosTurn}
      </div>
      
      <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        <strong>Turn:</strong> {currentFEN}
      </div>

      

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleClick} style={{ marginRight: '1rem' }}>
          Save
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
