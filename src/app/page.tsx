'use client';

import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import PositionSaveModal from './components/PositionSaveModal';

function formatPGNMoves(moves: string | string[]): string {
  if (!moves) return '';
  const moveList = Array.isArray(moves) ? moves : 
    (moves || '').split(/\s+/).filter(move => move?.trim()); // Split on whitespace instead of commas
  return moveList.join(' ');
}

function formatRemainingMoves(moves: string | string[]): string {
  if (!moves) return '';
  const moveList = Array.isArray(moves) ? moves : 
    (moves || '').split(/\s+/).filter(move => move?.trim()); // Split on whitespace instead of commas
  return moveList.join(' ');
}

// Force rebuild: 2025-05-23
export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [editFields, setEditFields] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);


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

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handlePositionSave = async (positionName: string, notes: string, turn: string) => {
    try {
      const token = localStorage.getItem('id_token'); // 🔐 Cognito token
  
      if (!token) {
        setError('User not authenticated');
        return;
      }
  
      const response = await fetch('https://sjnpwhxwms.us-east-1.awsapprunner.com/api/Position/SavePosition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: positionName,
          fen: lastValidFEN,
          whoseTurn: "Black",
          notes: notes
        })
      });
  
      // Check if response is not OK before parsing
      if (!response.ok) {
        const errorText = await response.text(); // Avoid trying to parse JSON if it's HTML
        throw new Error(errorText || 'Failed to save position');
      }
  
      const result = await response.json();
      console.log('✅ Saved position:', result);
  
      setError('Position saved successfully'); // Or setSuccess()
    } catch (err: any) {
      console.error('❌ Error saving position:', err);
      setError(err.message || 'Failed to save position');
    }
  };
  
  

  const handleSavePosition = () => {
    setIsSaveModalOpen(true);
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
    try {
      const latestCorrectMoves = editFields[0]?.trim() || '';
      const latestRemainingMoves = editFields[1]?.trim() || '';
      
      const combinedText = `${latestCorrectMoves}\n${latestRemainingMoves}`.trim();
      if (!combinedText) {
        setError("No valid moves to recheck. Please try again.");
        return;
      }

      const thinkmovessScannedGame: Record<string, { whiteMove: string; blackMove: string }> = {};
      
      // Remove move numbers and split into individual moves
      const moves = combinedText
        .replace(/\d+\.\s*/g, '') // Remove move numbers and dots
        .split(/\s+/) // Split by whitespace
        .filter(move => move.trim()); // Remove empty moves

      // Process moves in pairs (white, black)
      for (let i = 0; i < moves.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = moves[i];
        const blackMove = moves[i + 1] || '';
        thinkmovessScannedGame[moveNumber.toString()] = { whiteMove, blackMove };
      }

      // Log parsed game for debugging
      console.log('Parsed Game Sent to Lambda:', thinkmovessScannedGame);

      const payload = {
        body: JSON.stringify({ ThinkMoveScannedGame: thinkmovessScannedGame })
      };

      console.log("✅ Payload to Lambda:", payload);

      // AWS Lambda integration
      const aws_accessKey = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!;
      const aws_secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!;
      const lambdaFunctionName = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_NAME!;

      setLoading(true);

      const client = new LambdaClient({
        region: "us-east-1",
        credentials: {
          accessKeyId: aws_accessKey,
          secretAccessKey: aws_secretAccessKey,
        },
      });

      const command = new InvokeCommand({
        FunctionName: lambdaFunctionName,
        Payload: JSON.stringify(payload),
      });

      const response = await client.send(command);
      if (!response.Payload) {
        setError("No response payload received from Lambda.");
        return;
      }

      const resultString = new TextDecoder("utf-8").decode(response.Payload);
      console.log("📦 Raw Lambda Response:", resultString);

      let result;
      try {
        result = JSON.parse(resultString);
        console.log("✅ Level 1 Response:", result);
      } catch (e) {
        console.error("❌ Error parsing resultString:", e);
        throw new Error("Failed to parse resultString into JSON");
      }

      if (!result.body) {
        throw new Error("Lambda response missing body");
      }

      let parsedBody;
      try {
        parsedBody = JSON.parse(result.body);
        console.log("✅ Parsed Body:", parsedBody);
      } catch (e) {
        console.error("❌ Error parsing result.body:", e);
        throw new Error("Failed to parse result.body into object");
      }

      // Only update state if we have both correct and remaining moves
      if (Array.isArray(parsedBody.CorrectMovesPGN) && Array.isArray(parsedBody.RemainingPGN)) {
        const correctMoves = parsedBody.CorrectMovesPGN.join("\n");
        const remainingMoves = parsedBody.RemainingPGN.join("\n");
        
        console.log('✅ Correct Moves to set:', correctMoves);
        console.log('✅ Remaining Moves to set:', remainingMoves);
        
        setEditFields([correctMoves, remainingMoves]);
        updateMoveHistoryFromPGN(correctMoves);
        setLastValidFEN(parsedBody.LastValidFEN || 'start');
        setError(parsedBody.Error || "No Errors");
      } else {
        console.log('⚠️ Incomplete response received, not updating state');
        setError("Lambda response incomplete");
      }
    } catch (err) {
      console.error("❌ Error rechecking moves:", err);
      setError("Failed to recheck moves");
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
      const response = await fetch(process.env.NEXT_PUBLIC_THINKMOVES_API!, {
        method: 'POST',
        body: formData
      });

      // Parse the deeply nested response
      const resultString = await response.text();
      console.log('Raw Response:', resultString);

      const level1 = JSON.parse(resultString);
      console.log('Level 1 Response:', level1);

      const level2 = JSON.parse(level1.response);
      console.log('Level 2 Response:', level2);

      const parsedBody = JSON.parse(level2.body); // Final usable object
      console.log("Parsed Body:", parsedBody);

      // Extract and format values
      const correctMoves = formatPGNMoves(parsedBody.CorrectMovesPGN.join(' ') || '');
      const remainingMoves = formatRemainingMoves(parsedBody.RemainingPGN.join(' ') || '');
      const lastValidFEN = parsedBody.LastValidFEN || 'start';
      const error = parsedBody.Error || 'No Errors';

      console.log('Final Values:');
      console.log('Correct Moves:', correctMoves);
      console.log('Remaining Moves:', remainingMoves);
      console.log('Last Valid FEN:', lastValidFEN);
      console.log('Error:', error);

      setEditFields([correctMoves, remainingMoves]);
      updateMoveHistoryFromPGN(correctMoves);
      setLastValidFEN(lastValidFEN);
      setError(error);
  
    } catch (err) {
      console.error("❌ Error submitting moves:", err);
      setError("Failed to submit moves");
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
                key="correct-moves"
                value={editFields[0] || ''} 
                onChange={e => setEditFields([e.target.value, editFields[1] || ''])} 
                style={{ width: '100%', height: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '4px' }}>Remaining Moves</label>
              <textarea 
                key="remaining-moves"
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
        <button onClick={handleSharePosition} style={buttonStyle}>Share Position</button>
        <button onClick={handleShareGame} style={buttonStyle}>Share Game</button>
        <button onClick={handleOtherDetails} style={buttonStyle}>Other Details</button>
      </div>
      <button onClick={handleSavePosition} style={buttonStyle} className="fixed bottom-4 right-4 z-50">Save Position</button>
      {isSaveModalOpen && (
        <PositionSaveModal
          isOpen={true}
          onClose={() => setIsSaveModalOpen(false)}
          currentFEN={lastValidFEN}
          onSave={handlePositionSave}
        />
      )}
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