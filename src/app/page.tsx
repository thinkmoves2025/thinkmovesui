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
    <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-6">
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
        <p className="text-sm text-gray-700 mt-2 w-full text-center">
          {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>

    {/* Main Section */}
    <main className="min-h-screen bg-[#f9f9f9] px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-10 items-center lg:items-start">
        {/* Chessboard */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:pl-8">
<div className="w-full lg:w-1/2 flex justify-center lg:justify-end px-4">
  <Chessboard
  boardWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 500}
  position={lastValidFEN || 'start'}
/>

</div>




        <div className="flex justify-center gap-3 mt-4">
          {['start', 'prev', 'next', 'end'].map((action, idx) => (
            <button
              key={action}
              onClick={() => handleMoveNavigation(action as never)}
              className="px-3 py-2 bg-blue-600 text-white rounded text-lg"
            >
              {['⏮', '⏪', '⏩', '⏭'][idx]}
            </button>
          ))}
        </div>

        </div>
        {/* Right Side Panels */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {/* Moves Panels */}
          <div className="flex flex-col md:flex-row gap-4 w-full">

            {['Correct Moves', 'Remaining Moves', 'Suggested Moves'].map((label, i) => (
              <div key={label} className="flex-1">
                <label className="font-semibold block mb-1">{label}</label>
                {label === 'Suggested Moves' ? (
                  <div className="h-[150px] overflow-y-auto border rounded p-2 space-y-1">
                    {chess.moves().map((move, index) => (
                      <button
                        key={index}
                        onClick={() => alert(`Clicked ${move}`)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded block w-full text-left"
                      >
                        {move}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={editFields[i] || ''}
                    onChange={(e) => {
                      const newFields = [...editFields];
                      newFields[i] = e.target.value;
                      setEditFields(newFields);
                    }}
                    className="w-full min-h-[120px] border p-2 rounded text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Errors, Notes, Save/Recheck */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-semibold block mb-1">Error</label>
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded p-2 min-h-[44px] text-sm">
                {error || 'No Errors'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label className="text-sm font-semibold block mb-1">Notes</label>
                <input
                  type="text"
                  value={gameInfo.notes}
                  onChange={(e) => setGameInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Add notes here..."
                />
              </div>
              <button
                onClick={handleRecheck}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Rechecking...' : 'Recheck'}
              </button>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-2">

              <button onClick={handleSavePositionClick} style={buttonStyle}>Save Position</button>
              <button onClick={handleSaveGameClick} style={buttonStyle}>Save Game</button>
              <button onClick={() => alert('Coming Soon')} style={buttonStyle}>Share Position</button>
              <button onClick={() => alert('Coming Soon')} style={buttonStyle}>Share Game</button>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full max-w-4xl">
        {['blackPlayer', 'blackRating', 'whitePlayer', 'whiteRating', 'board', 'round'].map((key) => (
          <div key={key}>
            <label className="block font-medium mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
            <input
              value={gameInfo[key as keyof typeof gameInfo]}
              onChange={(e) => setGameInfo(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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

