'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to ThinkMoves</h1>
      <p>This is your homepage.</p>
    </main>
  );
}