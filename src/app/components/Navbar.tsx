'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  

  const checkToken = () => {
    const token = localStorage.getItem('id_token');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      window.innerWidth <= 768 && // ✅ Only mobile
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setMenuOpen(false);
    }
  };

  if (menuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [menuOpen]);


  useEffect(() => {
    checkToken();
    const handleLogin = () => checkToken();
    window.addEventListener('login-success', handleLogin);
    window.addEventListener('focus', checkToken);

    return () => {
      window.removeEventListener('login-success', handleLogin);
      window.removeEventListener('focus', checkToken);
    };
  }, []);

  if (!isLoggedIn) return null;

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}
    >
      {/* Main Nav Links */}
      <ul
        style={{
          display: 'flex',
          listStyleType: 'none',
          margin: 0,
          padding: 0,
          gap: '1rem',
        }}
      >
        <li><Link href="/">ThinkMoves</Link></li>
        <li><Link href="/games">Games</Link></li>
        <li><Link href="/position">Position</Link></li>

        {/* Desktop Only: Show About/Profile */}
        <li className="desktop-only"><Link href="/about">About</Link></li>
        <li className="desktop-only"><Link href="/profile">Profile</Link></li>
      </ul>

      {/* Mobile Only: 3 Dots Menu */}
      <div className="mobile-only" ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ⋮
        </button>

        {menuOpen && (
          <ul
            style={{
              position: 'absolute',
              top: '2.5rem',
              right: 0,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              listStyle: 'none',
              padding: '0.5rem 0',
              zIndex: 9999,
              minWidth: '120px',
            }}
          >
            <li style={{ padding: '0.5rem 1rem' }}>
              <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            </li>
            <li style={{ padding: '0.5rem 1rem' }}>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            </li>
          </ul>
        )}
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        .mobile-only {
          display: none;
        }

        .desktop-only {
          display: list-item;
        }

        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }

          .desktop-only {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
