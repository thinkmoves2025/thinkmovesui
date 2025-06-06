'use client';

import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import PositionSaveModal from './components/PositionSaveModal';
import GameSaveModal from './components/GameSaveModal';
import axios from 'axios';


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
  const [editFields, setEditFields] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [lastValidFEN, setLastValidFEN] = useState('start');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([new Chess().fen()]);


  const isValidFEN = (fen: string) => fen.split(' ').length === 6;

  const chess = new Chess(
    lastValidFEN && isValidFEN(lastValidFEN) ? lastValidFEN : undefined
  );
  const [gameInfo, setGameInfo] = useState({
    correctPGN: '',
    remainingPGN: '',
    blackPlayer: '',
    whitePlayer: '',
    blackRating: '',
    whiteRating: '',
    board: '',
    round: ''
  });

  useEffect(() => {
    const storedFEN = localStorage.getItem('storedFEN');
    const correctPGN = localStorage.getItem('correctMoves');
    const remainingPGN = localStorage.getItem('remainingMoves');

    const blackPlayer = localStorage.getItem('blackPlayer');
    const whitePlayer = localStorage.getItem('whitePlayer');
    const blackRating = localStorage.getItem('blackRating');
    const whiteRating = localStorage.getItem('whiteRating');
    
    const round = localStorage.getItem('round');
    const board = localStorage.getItem('board');
  
    if (storedFEN) setLastValidFEN(storedFEN);
    if (correctPGN || remainingPGN) setEditFields([correctPGN || '', remainingPGN || '']);

    if (correctPGN || remainingPGN) {
      setEditFields([correctPGN || '', remainingPGN || '']);
    }
    
    if (
      blackPlayer || whitePlayer || blackRating || whiteRating || board || round
    ) {
      setGameInfo({
        blackPlayer: blackPlayer || '',
        whitePlayer: whitePlayer || '',
        blackRating: blackRating || '',
        whiteRating: whiteRating || '',
        board: board || '',
        round: round || '',
        correctPGN: '',
        remainingPGN: ''
      });
    }
    
  }, []);
  
  useEffect(() => {
    localStorage.setItem('storedFEN', lastValidFEN);
    localStorage.setItem('correctMoves', editFields[0]);
    localStorage.setItem('remainingMoves', editFields[1]);
  
    localStorage.setItem('blackPlayer', gameInfo.blackPlayer);
    localStorage.setItem('whitePlayer', gameInfo.whitePlayer);
    localStorage.setItem('blackRating', gameInfo.blackRating);
    localStorage.setItem('whiteRating', gameInfo.whiteRating);
    localStorage.setItem('board', gameInfo.board);
    localStorage.setItem('round', gameInfo.round);
  }, [lastValidFEN, editFields, gameInfo]);
  
  

  const [isPositionSaveModalOpen, setIsPositionSaveModalOpen] = useState(false); 
  const [showGameModal, setShowGameModal] = useState(false);


  const handleSavePositionClick = () => {
    setIsPositionSaveModalOpen(true); // open modal
  };

    const handleSaveGameClick = () => {
    setShowGameModal(true); // open modal
  };

  /*
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
  };*/

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
      //console.log('Parsed Game Sent to Lambda:', thinkmovessScannedGame);

      const payload = {
        body: JSON.stringify({ ThinkMoveScannedGame: thinkmovessScannedGame })
      };

      //console.log("✅ Payload to Lambda:", payload);

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
        //console.log("✅ Level 1 Response:", result);
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
        //console.log("✅ Parsed Body:", parsedBody);
      } catch (e) {
        console.error("❌ Error parsing result.body:", e);
        throw new Error("Failed to parse result.body into object");
      }

      // Only update state if we have both correct and remaining moves
      if (Array.isArray(parsedBody.CorrectMovesPGN) && Array.isArray(parsedBody.RemainingPGN)) {
        const correctMoves = parsedBody.CorrectMovesPGN.join("\n");
        const remainingMoves = parsedBody.RemainingPGN.join("\n");
        
        //console.log('✅ Correct Moves to set:', correctMoves);
        //console.log('✅ Remaining Moves to set:', remainingMoves);
        
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

      const level1 = JSON.parse(resultString);

      const level2 = JSON.parse(level1.response);

      const parsedBody = JSON.parse(level2.body); // Final usable object

      // Extract and format values
      const correctMoves = formatPGNMoves(parsedBody.CorrectMovesPGN.join(' ') || '');
      const remainingMoves = formatRemainingMoves(parsedBody.RemainingPGN.join(' ') || '');
      const lastValidFEN = parsedBody.LastValidFEN || 'start';
      const error = parsedBody.Error || 'No Errors';
      
      const metadataString = parsedBody.GameMetaDataJSON;
      const metadataParsed = JSON.parse(metadataString);
      const gameMetadata = metadataParsed.GameMetadata;

      const blackRating = gameMetadata.BlackRating;
      const whiteRating = gameMetadata.WhiteRating;
      const round = gameMetadata.Round;
      const board = gameMetadata.Board;

      setGameInfo(prev => ({
        ...prev,
        blackPlayer: gameMetadata.BlackPlayer || '',
        whitePlayer: gameMetadata.WhitePlayer || '',
        blackRating: gameMetadata.BlackRating || '',
        whiteRating: gameMetadata.WhiteRating || '',
        board: gameMetadata.Board || '',
        round: gameMetadata.Round || ''
      }));
      


      //console.log('Final Values:');
      //console.log('Correct Moves:', correctMoves);
      //console.log('Remaining Moves:', remainingMoves);
      //console.log('Last Valid FEN:', lastValidFEN);

      console.log('blackRating:', blackRating);
      console.log('whiteRating:', whiteRating);
      console.log('round:', round);
      console.log('board:', board);


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
    <>
<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]); // Only taking one — update this if needed
    }
  }}
/>


    <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>{loading ? 'Processing...' : 'Submit Image'}</button>
    <main
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 2rem',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
  }}
>
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '2rem',
      width: '100%',
      maxWidth: '1400px',
    }}
  >
    {/* Left: Chessboard and navigation */}
    <div style={{ flex: 1, minWidth: '300px' }}>
      <Chessboard boardWidth={600} position={lastValidFEN || 'start'} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('start')}>⏮</button>
        <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('prev')}>⏪</button>
        <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('next')}>⏩</button>
        <button style={{ ...buttonStyle, minWidth: '50px' }} onClick={() => handleMoveNavigation('end')}>⏭</button>
      </div>
    </div>

    {/* Right: Text areas and player info */}
    <div
      style={{
        flex: 1,
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label>Correct Moves</label>
          <textarea
            value={editFields[0] || ''}
            onChange={(e) => setEditFields([e.target.value, editFields[1] || ''])}
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Remaining Moves</label>
          <textarea
            value={editFields[1] || ''}
            onChange={(e) => setEditFields([editFields[0] || '', e.target.value])}
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label>Black Player</label>
          <input
            value={gameInfo.blackPlayer}
            onChange={(e) => setGameInfo(prev => ({ ...prev, blackPlayer: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label>Black Rating</label>
          <input
            value={gameInfo.blackRating}
            onChange={(e) => setGameInfo(prev => ({ ...prev, blackRating: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label>White Player</label>
          <input
            value={gameInfo.whitePlayer}
            onChange={(e) => setGameInfo(prev => ({ ...prev, whitePlayer: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label>White Rating</label>
          <input
            value={gameInfo.whiteRating}
            onChange={(e) => setGameInfo(prev => ({ ...prev, whiteRating: e.target.value }))}
            style={inputStyle}
          />
        </div>


        <div>
          <label>Board</label>
          <input
            value={gameInfo.board}
            onChange={(e) => setGameInfo(prev => ({ ...prev, board: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label>Round</label>
          <input
            value={gameInfo.round}
            onChange={(e) => setGameInfo(prev => ({ ...prev, round: e.target.value }))}
            style={inputStyle}
          />
        </div>



      </div>

      <div>
        <label>Error</label>
        <div
          style={{
            padding: '10px',
            backgroundColor: '#eee',
            borderRadius: '6px',
            minHeight: '40px',
          }}
        >
          {error || 'No Errors'}
        </div>
        <button
          onClick={handleRecheck}
          disabled={loading}
          style={{ ...secondaryButton, marginTop: '0.75rem' }}
        >
          Recheck
        </button>
      </div>
    </div>
  </div>

  {/* Bottom: Action buttons */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '4rem',
      width: '100%',
    }}
  >
{/*
  <button onClick={handleSharePosition} style={buttonStyle}>Share Position</button>
  <button onClick={handleShareGame} style={buttonStyle}>Share Game</button>
*/}

  {/* 2x5 Grid Section */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(2, auto)',
    gap: '1rem',
    marginTop: '2rem',
    width: '100%',
    maxWidth: '1000px',
    marginInline: 'auto',
  }}
>
  {Array.from({ length: 10 }).map((_, idx) => (
    <div
      key={idx}
      style={{
        backgroundColor: '#f9f9f9',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
        fontWeight: 500,
        border: '1px solid #ddd',
      }}
    >
      Cell {idx + 1}
    </div>
  ))}
</div>


    <button onClick={handleSavePositionClick} style={buttonStyle}>Save Position</button>
    <button onClick={handleSaveGameClick} style={buttonStyle}>Save Game</button>
  </div>
</main>

    {isPositionSaveModalOpen && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <PositionSaveModal         
            onClose={() => setIsPositionSaveModalOpen(false)}
            currentFEN={lastValidFEN}         
            whosTurn={chess.turn() === 'w' ? 'White' : 'Black'}
            
            onSave={async (name, notes, whosTurn) => {
              const token = localStorage.getItem('id_token');
              if (!token) {
                alert('Not logged in!');
                return;
              }
                         
              whosTurn = chess.turn() === 'w' ? 'White' : 'Black';
              const payload = {               
                name,
                notes,
                whosTurn,
                fen: lastValidFEN,
              };
            
              try {
                await axios.post(
                  'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Position/SavePosition',
                  payload,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                alert('Position saved!');
                setIsPositionSaveModalOpen(false);
              } catch (err) {
                console.error('Save failed:', err);
                alert('Error saving position');
              }
            }}
                    />
      </div>
    )}

    {showGameModal && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
    <GameSaveModal
  onClose={() => setShowGameModal(false)}
  imageFile={image}
  gameInfo={{
    ...gameInfo,
    correctPGN: editFields[0],
    remainingPGN: editFields[1]
  }}
/>

  </div>
)}

    </>
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

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  fontSize: '0.9rem',
};
