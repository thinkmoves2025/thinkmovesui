'use client';

import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import axios from 'axios';
import { Chess } from 'chess.js';

function formatPGNMoves(moves: string | string[]): string {
  if (!moves) return '';
  const moveList = Array.isArray(moves) ? moves : (moves || '').split(',').filter(move => move?.trim());
  return moveList.join('\n');
}

function formatRemainingMoves(moves: string | string[]): string {
  if (!moves) return '';
  const moveList = Array.isArray(moves) ? moves : (moves || '').split(',').filter(move => move?.trim());
  return moveList.join('\n');
}

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [editFields, setEditFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dummyState, setDummyState] = useState(false);

  const [lastValidFEN, setLastValidFEN] = useState<string>('start');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  type PlayerInfo = {
    blackPlayer: string;
    whitePlayer: string;
    blackRating: string;
    whiteRating: string;
  };

  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    blackPlayer: '',
    whitePlayer: '',
    blackRating: '',
    whiteRating: ''
  });

  // Button handlers
  const handleSavePosition = async () => {
    try {
      const response = await fetch('/api/save-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: lastValidFEN,
          blackPlayer: playerInfo.blackPlayer,
          whitePlayer: playerInfo.whitePlayer,
          blackRating: playerInfo.blackRating,
          whiteRating: playerInfo.whiteRating,
          moves: editFields[0]
        })
      });
      const result = await response.json();
      setError(result.error || 'Position saved successfully');
    } catch (err) {
      console.error('Error saving position:', err);
      setError('Failed to save position');
    }
  };

  const handleSharePosition = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('fen', lastValidFEN);
      await navigator.clipboard.writeText(url.toString());
      setError('Position link copied to clipboard');
    } catch (err) {
      console.error('Error sharing position:', err);
      setError('Failed to share position');
    }
  };

  const handleShareGame = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('pgn', editFields[0]);
      await navigator.clipboard.writeText(url.toString());
      setError('Game link copied to clipboard');
    } catch (err) {
      console.error('Error sharing game:', err);
      setError('Failed to share game');
    }
  };

  const handleOtherDetails = () => {
    // Add your implementation for other details here
    setError('Other details functionality coming soon');
  };

  const updateMoveHistoryFromPGN = (pgn: string) => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const parsedMoves = chess.history();
    chess.reset();
    const historyFENs = [chess.fen()];
    parsedMoves.forEach(move => {
      chess.move(move);
      historyFENs.push(chess.fen());
    });
    setMoveHistory(historyFENs);
    setCurrentMoveIndex(0);
    setLastValidFEN(historyFENs[0]);
  };

  const handleMoveNavigation = (action: 'start' | 'prev' | 'next' | 'end') => {
    setError('');
    if (!moveHistory.length) return setError('No move history available');
    let newIndex = currentMoveIndex;
    if (action === 'start') newIndex = 0;
    else if (action === 'end') newIndex = moveHistory.length - 1;
    else if (action === 'prev' && currentMoveIndex > 0) newIndex = currentMoveIndex - 1;
    else if (action === 'next' && currentMoveIndex < moveHistory.length - 1) newIndex = currentMoveIndex + 1;
    else return setError(`Already at the ${action === 'prev' ? 'first' : 'last'} move`);
    setCurrentMoveIndex(newIndex);
    setLastValidFEN(moveHistory[newIndex]);
  };

  const handleRecheck = async () => {
    const latestCorrectMoves = editFields[0]?.trim() || '';
    const latestRemainingMoves = editFields[1]?.trim() || '';
    const combinedText = `${latestCorrectMoves}\n${latestRemainingMoves}`.trim();
    if (!combinedText) return setError("No valid moves to recheck. Please try again.");

    const lines = combinedText.split("\n");
    const thinkmovessScannedGame: Record<string, { whiteMove: string; blackMove: string }> = {};
    lines.forEach(line => {
      const parts = line.trim().split(" ");
      const moveNumber = parts[0]?.replace('.', '');
      if (moveNumber && parts[1]) {
        thinkmovessScannedGame[moveNumber] = {
          whiteMove: parts[1],
          blackMove: parts[2] || '',
        };
      }
    });

    const payload = { body: JSON.stringify({ ThinkMoveScannedGame: thinkmovessScannedGame }) };
    try {
      setLoading(true);
      const client = new LambdaClient({
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      });
      const command = new InvokeCommand({
        FunctionName: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_NAME!,
        Payload: JSON.stringify(payload),
      });
      const response = await client.send(command);
      if (response.Payload) {
        const resultString = new TextDecoder("utf-8").decode(response.Payload);
        try {
          // First parse level-1 string
          const level1 = JSON.parse(resultString);
          
          // Then parse inner 'body' string
          const parsedBody = JSON.parse(level1.body);
          
          // Update edit fields
          setEditFields([
            parsedBody.CorrectMovesPGN ? formatPGNMoves(parsedBody.CorrectMovesPGN) : latestCorrectMoves,
            parsedBody.RemainingPGN ? formatRemainingMoves(parsedBody.RemainingPGN) : latestRemainingMoves
          ]);

          // Update move history
          const formattedPGN = formatPGNMoves(parsedBody.CorrectMovesPGN || latestCorrectMoves || '');
          if (formattedPGN) {
            updateMoveHistoryFromPGN(formattedPGN);
          } else {
            setError('No valid PGN moves found');
          }
          
          // Debug logs to check FEN values
          console.log('API Response:', parsedBody);
          console.log('LastFEN:', parsedBody.LastFEN);
          
          // Get the FEN position from the move history if LastFEN is empty
          const lastFEN = parsedBody.LastValidFEN || (moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : 'start');
          console.log('Using FEN:', lastFEN);
          
          // Update chessboard position
          setLastValidFEN(lastFEN);
          
          // Force re-render
          setDummyState(prev => !prev);

          // Set error message from API response
          setError(parsedBody.Error || 'No Errors');
        } catch (err) {
          console.error("Error parsing nested Lambda response:", err);
          console.log("Raw payload:", resultString);
          setError("Error parsing server response. Check console for details.");
        }
      } else {
        setError("No response payload received from Lambda.");
      }
    } catch (error) {
      console.error("Recheck Error:", error);
      setError("Failed to invoke Lambda function. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!image) return setError('Please select an image first.');
    const formData = new FormData();
    formData.append("gameImages", image);
    setLoading(true);
    try {
      const thinkmovessURL = process.env.NEXT_PUBLIC_THINKMOVES_API!;
      let apiResponse;
      try {
        apiResponse = await axios.post(thinkmovessURL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // First parse level-1 string
        const level1 = JSON.parse(apiResponse.data.response);
        
        // Then parse inner 'body' string
        const parsedBody = JSON.parse(level1.body);

        // Update edit fields
        setEditFields([
          parsedBody.CorrectMovesPGN ? formatPGNMoves(parsedBody.CorrectMovesPGN) : '',
          parsedBody.RemainingPGN ? formatRemainingMoves(parsedBody.RemainingPGN) : ''
        ]);

        // Ensure we pass a proper PGN string to updateMoveHistory
        updateMoveHistoryFromPGN(formatPGNMoves(parsedBody.CorrectMovesPGN || ''));
        // Debug logs to check FEN values
        console.log('API Response:', parsedBody);
        console.log('LastFEN:', parsedBody.LastFEN);
        
        // Update chessboard position with LastFEN
        setLastValidFEN(parsedBody.LastValidFEN || 'start');
        console.log('Updated lastValidFEN:', lastValidFEN); // This won't show updated value due to async nature
        setError(parsedBody.Error || 'No Errors');
      } catch (err) {
        console.error("Error parsing nested API response:", err);
        console.log("Raw payload:", apiResponse?.data?.response);
        setError("Error parsing server response. Check console for details.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("Failed to parse API response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', minHeight: '100vh' }}>
      <input type="file" accept="image/*" onChange={(e) => e.target.files && setImage(e.target.files[0])} />
      <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>{loading ? 'Processing...' : 'Submit Image'}</button>
      <div style={{ display: 'flex', marginTop: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Chessboard boardWidth={600} position={lastValidFEN || 'start'} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('start')}>⏮</button>
            <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('prev')}>⏪</button>
            <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('next')}>⏩</button>
            <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('end')}>⏭</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '4px' }}>Correct Moves</label>
              <textarea 
                value={editFields[0] || ''} 
                onChange={e => setEditFields([e.target.value, editFields[1] || ''])} 
                style={{ width: '100%', height: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '4px' }}>Remaining Moves</label>
              <textarea 
                value={editFields[1] || ''} 
                onChange={e => setEditFields([editFields[0] || '', e.target.value])} 
                style={{ width: '100%', height: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ marginBottom: '4px' }}>Black Player</label>
                <input 
                  value={playerInfo.blackPlayer} 
                  onChange={e => setPlayerInfo(prev => ({ ...prev, blackPlayer: e.target.value }))} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ marginBottom: '4px' }}>Black Rating</label>
                <input 
                  value={playerInfo.blackRating} 
                  onChange={e => setPlayerInfo(prev => ({ ...prev, blackRating: e.target.value }))} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ marginBottom: '4px' }}>White Player</label>
                <input 
                  value={playerInfo.whitePlayer} 
                  onChange={e => setPlayerInfo(prev => ({ ...prev, whitePlayer: e.target.value }))} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ marginBottom: '4px' }}>White Rating</label>
                <input 
                  value={playerInfo.whiteRating} 
                  onChange={e => setPlayerInfo(prev => ({ ...prev, whiteRating: e.target.value }))} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div>
              <label style={{ marginBottom: '4px' }}>Error</label>
              <div style={{ padding: '8px', backgroundColor: '#eee', borderRadius: '4px' }}>{error || 'No Errors'}</div>
              <button onClick={handleRecheck} disabled={loading} style={{ ...secondaryButton, marginTop: '0.5rem' }}>Recheck</button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '4rem', width: '100%' }}>
        <button onClick={handleSavePosition} style={buttonStyle}>Save Position</button>
        <button onClick={handleSharePosition} style={buttonStyle}>Share Position</button>
        <button onClick={handleShareGame} style={buttonStyle}>Share Game</button>
        <button onClick={handleOtherDetails} style={buttonStyle}>Other Details</button>
      </div>
    </main>
  );

}

const buttonStyle = {
  padding: '12px 16px',
  backgroundColor: '#3498db',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  minWidth: '150px'
};

const secondaryButton = {
  ...buttonStyle,
  backgroundColor: '#ccc',
  color: '#333'
};