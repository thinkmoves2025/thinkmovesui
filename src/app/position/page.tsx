'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Chessboard } from "react-chessboard";

export default function PositionsPage() {
  const router = useRouter();

  type Position = {
    posID: string;
    fen: string;
    whosTurn: string;
    notes: string;
    likes: number;
    createdBy: string;
    createdTime: string;
  };

  const [positions, setPositions] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('id_token');

    if (!token) {
      router.push('/login');
    } else {
      setIsClient(true);
      axios
        .post(
          'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Position/GetAllPositions',
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setPositions(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch positions:', err);
        });
    }
  }, [router]);

  if (!isClient) return <p>Checking login...</p>;

  return (
  <div className="p-4 max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Saved Positions</h1>

    {positions.length === 0 ? (
      <p className="text-gray-500">No positions found.</p>
    ) : (
      <ul className="space-y-6">
        {positions.map((pos, index) => (
          <li
            key={index}
            className="border rounded bg-white shadow-md p-4 flex flex-col items-center"
          >
            {/* Chessboard */}
            <div className="mb-4">
              <Chessboard position={pos.fen} boardWidth={192} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm w-full max-w-3xl">
              <p><strong>Position ID:</strong> {pos.posID}</p>
              <p className="break-all"><strong>FEN:</strong> {pos.fen}</p>
              <p><strong>Turn:</strong> {pos.whosTurn}</p>
              <p className="break-words"><strong>Notes:</strong> {pos.notes}</p>
              <p><strong>Likes:</strong> {pos.likes}</p>
              <p className="break-words"><strong>Created By:</strong> {pos.createdBy}</p>
              <p><strong>Created Time:</strong> {pos.createdTime}</p>
            </div>

            {/* View Button */}
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() =>
                  window.open(
                    `/view-position?fen=${encodeURIComponent(pos.fen)}&posID=${encodeURIComponent(pos.posID)}&whosTurn=${pos.whosTurn}&notes=${encodeURIComponent(pos.notes)}&likes=${pos.likes}&createdBy=${pos.createdBy}&createdTime=${encodeURIComponent(pos.createdTime)}`,
                    "_blank"
                  )
                }
              >
                View Position in New Tab
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
