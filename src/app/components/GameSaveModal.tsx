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
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const token = localStorage.getItem('id_token');
    if (!token || !imageFile) {
      alert('Missing token or image');
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
    formData.append('name', name);
    formData.append('notes', notes);
    formData.append('gameImages', imageFile); // This is the actual image file

    try {
      await axios.post('https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Game/SaveGame', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Game saved!');
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving game');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
        <h3>Save Game</h3>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '8px' }} />
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', height: '100px', marginBottom: '1rem', padding: '8px' }} />
        <button onClick={handleSave} style={{ marginRight: '1rem', padding: '8px 16px' }}>Save</button>
        <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
      </div>
    </div>
  );
}
