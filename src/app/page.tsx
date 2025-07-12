/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
//import PositionSaveModal from './components/PositionSaveModal';
import GameSaveModal from './components/GameSaveModal';
import axios from 'axios';
//import { useRef } from 'react';



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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');
  const [editFields, setEditFields] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [lastValidFEN, setLastValidFEN] = useState('start');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([new Chess().fen()]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedFiles] = useState<File[]>([]);
  const [positionNotes, setPositionNotes] = useState('');

  
  ///const [notes, setNotes] = useState('');



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
    round: '',
    notes: ''
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
    const notes = localStorage.getItem('notes');
  
    if (storedFEN) setLastValidFEN(storedFEN);
    if (correctPGN || remainingPGN) setEditFields([correctPGN || '', remainingPGN || '']);

    if (correctPGN || remainingPGN) {
      setEditFields([correctPGN || '', remainingPGN || '']);
    }
    
    if (
      blackPlayer || whitePlayer || blackRating || whiteRating || board || round || notes
    ) {
      setGameInfo({
        blackPlayer: blackPlayer || '',
        whitePlayer: whitePlayer || '',
        blackRating: blackRating || '',
        whiteRating: whiteRating || '',
        board: board || '',
        round: round || '',
        correctPGN: '',
        remainingPGN: '',
        notes : ''
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
    localStorage.setItem('notes', gameInfo.notes);
  }, [lastValidFEN, editFields, gameInfo]);
  
  

  const [PositionSaveModal, setIsPositionSaveModalOpen] = useState(false); 
  const [showGameModal, setShowGameModal] = useState(false);


  const handleSavePositionClick = () => {
    setIsPositionSaveModalOpen(true); // open modal
  };

    const handleSaveGameClick = () => {
    setShowGameModal(true); // open modal
  };

  

  //Future Scope
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
  if (!image) {
    setError('Please select an image first.');
    return;
  }

  const formData = new FormData();
  formData.append("gameImages", image);

  const token = localStorage.getItem('id_token');
  console.log("📦 Sending access token:", token);

  if (!token) {
    setError("No access token found. Please log in.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_THINKMOVES_API!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const rawText = await response.text();

    if (!response.ok || !rawText) {
      console.error("❌ Submission failed:", {
        status: response.status,
        statusText: response.statusText,
        body: rawText,
      });
      setError(`Failed with ${response.status}: ${rawText || 'Server error'}`);
      return;
    }

    const result = JSON.parse(rawText);
    const parsed = JSON.parse(result.gameJsonResponse);

    const correctMoves = formatPGNMoves(parsed.CorrectMovesPGN?.join(' ') || '');
    const remainingMoves = formatRemainingMoves(parsed.RemainingPGN?.join(' ') || '');
    const lastValidFEN = parsed.LastValidFEN || 'start';
    const error = parsed.Error || 'No Errors';

    const gameMetadata = JSON.parse(parsed.GameMetaDataJSON);


    setGameInfo(prev => ({
      ...prev,
      blackPlayer: gameMetadata.BlackName || '',
      whitePlayer: gameMetadata.WhiteName || '',
      blackRating: gameMetadata.BlackRating || '',
      whiteRating: gameMetadata.WhiteRating || '',
      board: gameMetadata.Board || '',
      round: gameMetadata.Round || '',
    }));

    setEditFields([correctMoves, remainingMoves]);
    updateMoveHistoryFromPGN(correctMoves);
    setLastValidFEN(lastValidFEN);
    setError(error);

  } catch (err) {
    const error = err as unknown as Error;
    console.error("❌ Error submitting moves:", {
      message: error.message,
      stack: error.stack,
      err,
    });
    setError("Failed to submit moves: " + error.message);
  } finally {
    setLoading(false);
  }
};





    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  


  

  return (
  <>
    {/* Image Upload + Action Buttons */}
    <div className="flex items-center justify-center gap-4 px-4 py-6 flex-wrap">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />

<button
  onClick={() => inputRef.current?.click()}
  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-3 px-6 rounded-full"
>
  Upload Image(s)
</button>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Analyze Game'}
      </button>

      <button
        onClick={() => setShowOverlay(true)}
        className="text-base text-blue-600 underline hover:text-blue-800"
      >
        How it works?
      </button>

        {selectedFiles.length > 0 && (
    <p className="text-sm text-gray-700 mt-2 text-center w-full">
      {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""} selected
    </p>
  )}
    </div>

    {/* Main Content */}
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
    {/* Chessboard */}
    <div style={{ flex: 1, minWidth: '320px' }}>
      <Chessboard boardWidth={600} position={lastValidFEN || 'start'} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
        {['start', 'prev', 'next', 'end'].map((action, idx) => (
          <button
            key={action}
            onClick={() => handleMoveNavigation(action as never)}
            style={{
              padding: '8px 12px',
              minWidth: '50px',
              backgroundColor: '#0b80ee',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
          >
            {['⏮', '⏪', '⏩', '⏭'][idx]}
          </button>
        ))}
      </div>
    </div>

    {/* Right Side: Moves + Error/Notes below */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '320px' }}>
      {/* Move Panels */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* Correct */}
        <div style={{ flex: '1 1 30%' }}>
          <label style={labelStyle}>Correct Moves</label>
          <textarea
            value={editFields[0] || ''}
            onChange={(e) => setEditFields([e.target.value, editFields[1] || ''])}
            style={textareaStyle}
          />
        </div>

        {/* Remaining */}
        <div style={{ flex: '1 1 30%' }}>
          <label style={labelStyle}>Remaining Moves</label>
          <textarea
            value={editFields[1] || ''}
            onChange={(e) => setEditFields([editFields[0] || '', e.target.value])}
            style={textareaStyle}
          />
        </div>

        {/* Suggested */}
        <div style={{ flex: '1 1 30%' }}>
          <label style={labelStyle}>Suggested Moves</label>
          <div style={scrollBoxStyle}>
            {chess.moves().map((move, index) => (
  <button
    key={index}
    onClick={() => alert(`Clicked ${move}`)}
    style={suggestionButtonStyle}
  >
    {move}
  </button>
))}

          </div>
        </div>
      </div>

      {/* Error + Notes + Buttons */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {/* Error */}
    <div>
      <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>Error</label>
      <div
        style={{
          padding: '10px',
          backgroundColor: '#fef3c7',
          border: '1px solid #facc15',
          color: '#92400e',
          borderRadius: '6px',
          minHeight: '44px',
          fontSize: '0.9rem',
          lineHeight: '1.4',
        }}
      >
        {error || 'No Errors'}
      </div>
    </div>

    {/* Notes + Recheck */}
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem', display: 'block' }}>
          Notes
        </label>
        <input
          type="text"
          value={gameInfo.notes}
          onChange={(e) => setGameInfo(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add notes here..."
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '0.9rem',
          }}
        />
      </div>

      <button
        onClick={handleRecheck}
        disabled={loading}
        style={{
          padding: '10px 16px',
          backgroundColor: '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          height: '40px',
        }}
      >
        {loading ? 'Rechecking...' : 'Recheck'}
      </button>
    </div>

    {/* ✅ Save Buttons under Notes */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
      <button onClick={handleSavePositionClick} style={buttonStyle}>Save Position</button>
      <button onClick={handleSaveGameClick} style={buttonStyle}>Save Game</button>
      <button
  onClick={() => alert('Coming Soon')}
  style={buttonStyle}
>
  Share Position
</button>

<button
  onClick={() => alert('Coming Soon')}
  style={buttonStyle}
>
  Share Game
</button>
    </div>
  </div>
</div>
    </div>
  {/* Player Info */}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', width: '100%', maxWidth: '1000px' }}>
    {['blackPlayer', 'blackRating', 'whitePlayer', 'whiteRating', 'board', 'round'].map((key) => (
      <div key={key}>
        <label>{key.replace(/([A-Z])/g, ' $1')}</label>
        <input
          value={gameInfo[key as keyof typeof gameInfo]}
          onChange={(e) => setGameInfo(prev => ({ ...prev, [key]: e.target.value }))}
          style={inputStyle}
        />
      </div>
    ))}
  </div>

</main>


    {/* Overlay / Modals */}
    {showOverlay && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
<div
  style={{
    maxWidth: '500px',
    width: '90%',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    textAlign: 'left',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  }}
>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
    How it works
  </h2>

  <div style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6' }}>
    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
      <li>📤 <strong>Upload</strong> your scoresheet image(s) using the "Select Files" button.</li>
      <li>⚡ <strong>Analyze</strong> the game — AI will extract moves and player info.</li>
      <li>🛠️ <strong>Edit</strong> any errors directly in the move editor.</li>
      <li>🔁 <strong>Recheck</strong> with real chess logic to catch issues.</li>
      <li>💾 <strong>Save</strong> the game once you're satisfied.</li>
    </ul>

    <p style={{ marginBottom: '1rem' }}>
      🧾 <strong>Currently supported:</strong> ThinkMoves official scoresheets (front & back).
      More formats — including USCF scoresheets — are coming soon!
    </p>

    <p>
      Whether you're a player, coach, or tournament organizer, ThinkMoves makes it easy to digitize and manage your chess games.
      Upload a scoresheet, analyze the game, make corrections, and save it — all in seconds.
    </p>
  </div>

  <div style={{ textAlign: 'center' }}>
    <button
      onClick={() => setShowOverlay(false)}
      style={{
        marginTop: '1.5rem',
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '0.5rem 1.5rem',
        borderRadius: '999px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Got it
    </button>
  </div>
</div>


  </div>
)}


    {PositionSaveModal && (
  <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Save Position</h2>
        <button onClick={() => setIsPositionSaveModalOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Turn</label>
        <div className="text-gray-900">{chess.turn() === 'w' ? 'White' : 'Black'}</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">FEN</label>
        <div className="text-sm bg-gray-100 p-2 rounded text-gray-800 break-words">{lastValidFEN}</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={3}
          value={positionNotes}
          onChange={(e) => setPositionNotes(e.target.value)}
          placeholder="Add notes here..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
          onClick={() => setIsPositionSaveModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          onClick={async () => {
            const token = localStorage.getItem('id_token');
            if (!token) return alert('Not logged in!');
            try {
              await axios.post(
                'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Position/SavePosition',
                {
                  notes: positionNotes,
                  whosTurn: chess.turn() === 'w' ? 'White' : 'Black',
                  fen: lastValidFEN,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              alert('Position saved!');
              setIsPositionSaveModalOpen(false);
            } catch (err) {
              console.error('Save failed:', err);
              alert('Error saving position');
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
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

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  fontSize: '0.9rem',
};

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
  color: '#1f2937',
};

const textareaStyle = {
  width: '100%',
  height: '280px',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  fontSize: '0.9rem',
  resize: 'vertical' as const,
};

const scrollBoxStyle = {
  height: '280px',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  backgroundColor: '#fff',
  overflowY: 'auto' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const suggestionButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background 0.2s',
};
