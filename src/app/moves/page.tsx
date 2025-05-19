'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';import React from 'react';

export default function MovesPage() {
  const router = useRouter();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;

    if (!token) {
      router.push('/login');
    } else {
      setIsClientReady(true);
    }
  }, [router]);

  if (!isClientReady) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Chess Moves</h1>
      <div style={{ marginTop: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>e4 e5 - Classic Opening</li>
          <li style={{ marginBottom: '1rem' }}>e4 d5 - Defensive Setup</li>
          <li style={{ marginBottom: '1rem' }}>e4 c5 - Sicilian Defense</li>
          <li style={{ marginBottom: '1rem' }}>e4 e6 - French Defense</li>
          <li style={{ marginBottom: '1rem' }}>e4 c6 - Caro-Kann Defense</li>
        </ul>
      </div>
    </main>
  );
}
