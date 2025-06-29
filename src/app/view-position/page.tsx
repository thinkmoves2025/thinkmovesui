"use client";
import { useSearchParams } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { useState } from "react";

export default function ViewPositionPage() {
  const searchParams = useSearchParams();
  const fen = searchParams.get("fen") || "startpos";

  const posID = searchParams.get("posID") || "Unknown";
  const whosTurn = searchParams.get("whosTurn") || "w";
  const initialNotes = searchParams.get("notes") || "";
  const likes = searchParams.get("likes") || "0";
  const createdBy = searchParams.get("createdBy") || "Unknown";
  const createdTime = searchParams.get("createdTime") || "Unknown";

  const [notes, setNotes] = useState(initialNotes);
  const suggestedMoves = ["e4", "Nf3", "d4"]; // dummy placeholder

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">ThinkMoves</h1>

      <div className="max-w-7xl mx-auto bg-white rounded shadow p-6 flex flex-col md:flex-row gap-6">
        {/* Left: Bigger Chessboard */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Chessboard position={fen} boardWidth={480} />
        </div>

        {/* Right: Details Panel */}
        <div className="w-full md:w-1/2 space-y-4">

          {/* Editable Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Edit notes while analyzing the position..."
            />
          </div>

          {/* New Moves and Suggested Moves */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold text-sm mb-2">New Moves</h2>
              <div className="bg-gray-50 border border-gray-200 rounded p-2 min-h-[100px] text-xs text-gray-700">
                No new moves yet.
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-sm mb-2">Suggested Moves</h2>
              <div className="flex flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded p-2 min-h-[100px]">
                {suggestedMoves.length > 0 ? (
                  suggestedMoves.map((move, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-full text-blue-800"
                    >
                      {move}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No suggestions yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <p><strong>Position ID:</strong> {posID}</p>
            <p><strong>Turn:</strong> {whosTurn}</p>
            <p><strong>Likes:</strong> {likes}</p>
            <p><strong>Created By:</strong> {createdBy}</p>
            <p><strong>Created Time:</strong> {createdTime}</p>
          </div>

 <div className="flex justify-end gap-3 pt-4">
  <button
    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
    onClick={async () => {
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
          body: JSON.stringify({
            positionID: posID,
            notes: notes,
          }),
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
    }}
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
