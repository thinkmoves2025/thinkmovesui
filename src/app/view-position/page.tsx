'use client';
import { useSearchParams } from 'next/navigation';
import { Chessboard } from 'react-chessboard';
import { useState } from 'react';

export default function ViewPositionPage() {
  const searchParams = useSearchParams();

  const fen = searchParams.get("fen") || "start";
  const posID = searchParams.get("posID") || "Unknown";
  const whosTurn = searchParams.get("whosTurn") || "Unknown";
  const initialNotes = searchParams.get("notes") || "";
  const likes = searchParams.get("likes") || "0";
  const createdBy = searchParams.get("createdBy") || "Unknown";
  const createdTime = searchParams.get("createdTime") || "Unknown";

  const [notes, setNotes] = useState(initialNotes);
  const suggestedMoves = ["e4", "Nf3", "d4"]; // Replace with dynamic logic later

  const handleUpdate = async () => {
    const confirmed = window.confirm("Are you sure you want to update position?");
    if (!confirmed) return;

    const token = localStorage.getItem("id_token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }

    try {
      const response = await fetch("https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Position/UpdatePosition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ positionID: posID, notes }),
      });

      if (!response.ok) {
        const error = await response.text();
        alert(`Failed to update position:\n${error}`);
      } else {
        alert("Position updated successfully!");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("An error occurred while updating the position.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 flex justify-center">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Chessboard */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Chessboard position={fen} boardWidth={360} />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 space-y-6">
          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Edit notes while analyzing the position..."
            />
          </div>

          {/* Suggested & New Moves */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold text-sm mb-2">New Moves</h2>
              <div className="bg-gray-50 border rounded p-3 text-sm text-gray-500 min-h-[80px]">
                No new moves yet.
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-sm mb-2">Suggested Moves</h2>
              <div className="flex flex-wrap gap-2 bg-gray-50 border rounded p-3 min-h-[80px]">
                {suggestedMoves.length > 0 ? (
                  suggestedMoves.map((move, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded-full text-blue-800"
                    >
                      {move}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No suggestions yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>Position ID:</strong> {posID}</p>
            <p><strong>Turn:</strong> {whosTurn}</p>
            <p><strong>Likes:</strong> {likes}</p>
            <p className="break-all"><strong>Created By:</strong> {createdBy}</p>
            <p><strong>Created Time:</strong> {createdTime}</p>
            <p className="break-all"><strong>FEN:</strong> {fen}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4">
            <button
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
              onClick={handleUpdate}
            >
              Update Position
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              onClick={() => alert("Feature Coming Soon")}
            >
              Share Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
