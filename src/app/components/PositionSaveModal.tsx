'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

interface PositionSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFEN: string;
  onSave: (positionName: string, notes: string, turn: string) => void;
}

export default function PositionSaveModal({ 
  isOpen, 
  onClose, 
  currentFEN, 
  onSave 
}: PositionSaveModalProps) {
  const [positionName, setPositionName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Validate FEN and determine turn
  const validateFEN = (fen: string): { isValid: boolean; turn: string; error: string } => {
    try {
      const chess = new Chess(fen);
      return {
        isValid: true,
        turn: chess.turn() === 'w' ? 'White' : 'Black',
        error: ''
      };
    } catch {
      return {
        isValid: false,
        turn: '',
        error: 'Invalid board position. Please make sure your moves are correct.'
      };
    }
  };

  const { isValid, turn, error: fenError } = validateFEN(currentFEN);

  useEffect(() => {
    if (!isValid) {
      setError(fenError);
    } else {
      setError('');
    }
  }, [isValid, fenError]);

  const handleSubmit = () => {
    if (!positionName.trim()) {
      setError('Please enter a position name');
      return;
    }

    if (!isValid) {
      setError('Invalid board position. Please make sure your moves are correct.');
      return;
    }

    onSave(positionName, notes, turn);
    onClose();
  }

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Save Position</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position Name</label>
              <input
                type="text"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter position name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">FEN</label>
              <input
                type="text"
                value={currentFEN}
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Whose Turn</label>
              <input
                type="text"
                value={turn || 'Invalid FEN'}
                readOnly
                className={`w-full px-3 py-2 border rounded-md ${isValid ? 'bg-gray-50' : 'bg-red-50'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter any notes about this position..."
                rows={4}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}
