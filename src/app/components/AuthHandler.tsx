'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthHandler({ children }: { children: React.ReactNode }) {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('id_token');

      if (!token && window.location.pathname !== '/login') {
        router.push('/login');
      }

      setCheckedAuth(true);
    }
  }, [router]);

  if (!checkedAuth) {
    return <div>Checking login...</div>;
  }

  return <>{children}</>;
}
