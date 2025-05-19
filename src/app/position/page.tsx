'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PositionPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('id_token');

    if (!token) {
      router.push('/login');
    } else {
      setIsClient(true);
    }
  }, [router]);

  if (!isClient) return <div>Checking login...</div>;

  return (
    <div>
      <h1>Position Page</h1>
      <p>Protected page content for positions.</p>
    </div>
  );
}
