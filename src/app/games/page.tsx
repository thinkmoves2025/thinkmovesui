'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function MovesPage() {
  const router = useRouter();
  type Game = {
    name: string;
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
      <h1 className="text-xl font-bold mb-4">Saved Games</h1>
      {games.length === 0 ? (
        <p>No Games found.</p>
      ) : (
        <ul className="space-y-2">
          {games.map((game, index) => (
            <li key={index} className="border rounded p-3 bg-gray-100">
              <p><strong>Name:</strong> {game.name}</p>
              <p><strong>White Rating:</strong> {game.whiteRating}</p>
              <p><strong>White Name:</strong> {game.wpName}</p>
              <p><strong>Black Rating:</strong> {game.blackRating}</p>
              <p><strong>Black Name:</strong> {game.bpName}</p>
              <p><strong>Created By:</strong> {game.createdby}</p>
              <p><strong>Likes:</strong> {game.likes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
