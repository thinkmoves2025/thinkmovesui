'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkToken = () => {
    const token = localStorage.getItem('id_token');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkToken(); // Initial load

    // ✅ Listen for custom login event
    const handleLogin = () => {
      checkToken();
    };

    window.addEventListener('login-success', handleLogin);
    return () => window.removeEventListener('login-success', handleLogin);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
    }}>
      <ul style={{ display: 'flex', listStyleType: 'none', margin: 0, padding: 0 }}>
        <li style={{ margin: '0 15px' }}><Link href="/">ThinkMoves</Link></li>
        <li style={{ margin: '0 15px' }}><Link href="/games">Games</Link></li>
        <li style={{ margin: '0 15px' }}><Link href="/position">Position</Link></li>
        <li style={{ margin: '0 15px' }}><Link href="/about">About</Link></li>
        <li style={{ margin: '0 15px' }}><Link href="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
}
