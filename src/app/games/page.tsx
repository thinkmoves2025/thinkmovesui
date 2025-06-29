'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function MovesPage() {
  const router = useRouter();
  type Game = {
    gameID: string;
    blackRating: string;
    bpName: string;
    notes: string;
    whiteRating: string;
    wpName: string;
    createdby: string;
    likes:Int32Array
  };

 const [games, setGames] = useState<Game[]>([]);



    const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;

    if (!token) {
      router.push('/login');
    } else {
      setIsClient(true);

      axios
        .post(
          'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Game/GetAllGames',
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setGames(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch positions:', err);
        });
    }
  }, [router]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-6 text-center">Saved Games</h1>
    {games.length === 0 ? (
      <p className="text-center text-gray-600">No games found.</p>
    ) : (
      <ul className="space-y-4">
        {games.map((game, index) => (
          <li
            key={index}
            className="border rounded bg-white shadow p-4 space-y-1 text-sm"
          >
            <p><strong>Game ID:</strong> {game.gameID}</p>
            <p><strong>White:</strong> {game.wpName} ({game.whiteRating})</p>
            <p><strong>Black:</strong> {game.bpName} ({game.blackRating})</p>
            <p><strong>Created By:</strong> {game.createdby}</p>
            <p><strong>Likes:</strong> {game.likes}</p>
            <div className="pt-2 text-right">
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() =>
                  window.open(`/view-game?gameID=${encodeURIComponent(game.gameID)}`, '_blank')
                }
              >
                View Game
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

}
