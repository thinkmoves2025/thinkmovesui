'use client';

import { useState } from 'react';
import axios from 'axios';


interface GameSaveModalProps {
  onClose: () => void;
  imageFile: File | null;
  gameInfo: {
    correctPGN: string;
    remainingPGN: string;
    blackPlayer: string;
    whitePlayer: string;
    blackRating: string;
    whiteRating: string;
    board: string;
    round: string;
  };
}

export default function GameSaveModal({ onClose, imageFile, gameInfo }: GameSaveModalProps) {
  const [notes, setNotes] = useState('');

const handleSave = async () => {
  const token = localStorage.getItem('id_token');
  if (!token) {
    alert('Missing token');
    return;
  }

  const formData = new FormData();
  formData.append('correctMoves', gameInfo.correctPGN);
  formData.append('remainingMoves', gameInfo.remainingPGN);
  formData.append('bpName', gameInfo.blackPlayer);
  formData.append('blackRating', gameInfo.blackRating);
  formData.append('wpName', gameInfo.whitePlayer);
  formData.append('whiteRating', gameInfo.whiteRating);
  formData.append('board', gameInfo.board);
  formData.append('round', gameInfo.round);
  formData.append('notes', notes);

  if (imageFile) {
    formData.append('gameImages', imageFile);
  }

  try {
    await axios.post('https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Game/SaveGame', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert('Game saved!');
    onClose();
 } catch (err) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = err as any;
  console.error('Save failed:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });
  alert('Error saving game');
}


};


  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        minWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Save Game</h2>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes here..."
          style={{
            width: '100%',
            height: '120px',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1.5rem',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px' }}>
            Save
          </button>
          <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
