/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { CSSProperties } from 'react';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
 import { useMemo } from 'react';


const textareaStyle: CSSProperties = {
  width: '100%',
  height: '300px',
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '0.9rem',
};

const scrollBoxStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  height: '300px',
  overflowY: 'auto',
  border: '1px solid #ccc',
  borderRadius: '10px',
  padding: '1rem',
  backgroundColor: '#f9fafb',
};


const suggestionButtonStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#f3f4f6',
  fontSize: '1rem',
  fontWeight: 500,
  color: '#111827',
  cursor: 'pointer',
};


const buttonStyle: CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '0.9rem',
};

export default function ViewGamePage() {
  const searchParams = useSearchParams();
  const gameID = searchParams.get('gameID');

  const [gameInfo, setGameInfo] = useState({
    blackPlayer: '',
    blackRating: '',
    whitePlayer: '',
    whiteRating: '',
    board: '',
    round: '',
    notes: '',
  });

  const [editFields, setEditFields] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fen, setFen] = useState(new Chess().fen());
  let chessFromFen: Chess;

try {
  chessFromFen = new Chess(fen);
} catch {
  chessFromFen = new Chess(); // fallback to start position
}



// 👇 move this into your component function:
const suggestedMoves = useMemo(() => {
  try {
    const chess = new Chess(fen);
    return chess.moves();
  } catch {
    return [];
  }
}, [fen]);


  const [moveHistory, setMoveHistory] = useState<string[]>([]);
const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  
  

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const token = localStorage.getItem('id_token');
        const response = await fetch(
          'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Game/GetAFullGame',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ gameID }),
          }
        );

        const data = await response.json();
        const g = data.gamesTable;

        setGameInfo({
          blackPlayer: g.bpName,
          blackRating: g.blackRating,
          whitePlayer: g.wpName,
          whiteRating: g.whiteRating,
          board: g.board,
          round: g.round,
          notes: g.notes,
        });

        setEditFields([g.correctMoves, g.remainingMoves]);
        if (g.board) setFen(g.board); // board is FEN here
      } catch (err) {
        console.error('Error loading game:', err);
      }
    };

    if (gameID) {
      fetchGame();
    }
  }, [gameID]);

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
  setFen(moveHistory[newIndex]); // ✅ THIS is the fix
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
    const moves = combinedText
      .replace(/\d+\.\s*/g, '') // Remove move numbers
      .split(/\s+/)
      .filter(move => move.trim());

    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      thinkmovessScannedGame[moveNumber.toString()] = {
        whiteMove: moves[i],
        blackMove: moves[i + 1] || '',
      };
    }

    const payload = {
      body: JSON.stringify({ ThinkMoveScannedGame: thinkmovessScannedGame })
    };

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

    setLoading(true);
    const response = await client.send(command);

    if (!response.Payload) {
      setError("No response payload received from Lambda.");
      return;
    }

    const resultString = new TextDecoder("utf-8").decode(response.Payload);
    let result;
    try {
      result = JSON.parse(resultString);
    } catch (e) {
      throw new Error("Failed to parse Lambda result string");
    }

    if (!result.body) {
      throw new Error("Lambda response missing body");
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(result.body);
    } catch (e) {
      throw new Error("Failed to parse result.body into object");
    }

    // ✅ Update move list
    if (Array.isArray(parsedBody.CorrectMovesPGN) && Array.isArray(parsedBody.RemainingPGN)) {
      setEditFields([
        parsedBody.CorrectMovesPGN.join('\n'),
        parsedBody.RemainingPGN.join('\n'),
      ]);
    }

    // ✅ Update FEN history + current
    if (Array.isArray(parsedBody.MoveFENHistory) && parsedBody.MoveFENHistory.length > 0) {
  setMoveHistory(parsedBody.MoveFENHistory);
  setCurrentMoveIndex(parsedBody.MoveFENHistory.length - 1);
  setFen(parsedBody.MoveFENHistory.at(-1) || 'start');
} else if (parsedBody.LastValidFEN) {
  setMoveHistory([parsedBody.LastValidFEN]);
  setCurrentMoveIndex(0);
  setFen(parsedBody.LastValidFEN);
  setError("Move history not available; showing final position.");
} else {
  setError("Move history not found in Lambda response");
}


    // ✅ Update error message if any
    setError(parsedBody.Error || 'No Errors');
    
  } catch (err) {
    console.error("❌ Error rechecking moves:", err);
    setError("Failed to recheck moves");
  } finally {
    setLoading(false);
  }
};



  const handleUpdateGameClick = () => alert('Game Update Coming Soon!');
  const handleShareGameClick = () => alert('Game Share Coming Soon');

  return (
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
          <Chessboard boardWidth={600} position={fen} />
<div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
  {['start', 'prev', 'next', 'end'].map((action, idx) => (
    <button
      key={action}
      onClick={() => handleMoveNavigation(action as any)}
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

        {/* Right Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '320px' }}>
          {/* Move Panels */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 30%' }}>
              <label><strong>Correct Moves</strong></label>
              <textarea
                value={editFields[0]}
                onChange={(e) => setEditFields([e.target.value, editFields[1]])}
                style={textareaStyle}
              />
            </div>

            <div style={{ flex: '1 1 30%' }}>
              <label><strong>Remaining Moves</strong></label>
              <textarea
                value={editFields[1]}
                onChange={(e) => setEditFields([editFields[0], e.target.value])}
                style={textareaStyle}
              />
            </div>

<div style={{ flex: '1 1 30%' }}>
  <label><strong>Suggested Moves</strong></label>
  <div style={scrollBoxStyle}>
    {suggestedMoves.map((move, index) => (
      <button
        key={index}
        style={suggestionButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
      >
        {move}
      </button>
    ))}
  </div>
</div>


          </div>

          {/* Error + Notes + Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label><strong>Error</strong></label>
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #facc15',
                  color: '#92400e',
                  borderRadius: '6px',
                  minHeight: '44px',
                  fontSize: '0.9rem',
                }}
              >
                {error || 'No Errors'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label><strong>Notes</strong></label>
                <input
                  type="text"
                  value={gameInfo.notes}
                  onChange={(e) => setGameInfo((prev) => ({ ...prev, notes: e.target.value }))}
                  style={inputStyle}
                  placeholder="Add notes here..."
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={handleUpdateGameClick} style={buttonStyle}>Update Game</button>
              <button onClick={handleShareGameClick} style={buttonStyle}>Share Game</button>
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
              onChange={(e) => setGameInfo((prev) => ({ ...prev, [key]: e.target.value }))}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
