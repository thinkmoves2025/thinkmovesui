'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function PositionsPage() {
  const router = useRouter();
  type Position = {
    name: string;
    fen: string;
    whosTurn: string;
    notes: string;
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Saved Positions</h1>
      {positions.length === 0 ? (
        <p>No positions found.</p>
      ) : (
        <ul className="space-y-2">
          {positions.map((pos, index) => (
            <li key={index} className="border rounded p-3 bg-gray-100">
              <p><strong>Name:</strong> {pos.name}</p>
              <p><strong>FEN:</strong> {pos.fen}</p>
              <p><strong>Turn:</strong> {pos.whosTurn}</p>
              <p><strong>Notes:</strong> {pos.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
