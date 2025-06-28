'use client';

export default function LoginPage() {
  const handleLogin = () => {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    const redirectUri =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3000/callback'
        : 'https://thinkmovesui.vercel.app/callback';

    if (typeof window !== 'undefined' && domain && clientId) {
      const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = loginUrl;
    } else {
      console.error('Missing env vars or not in browser');
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
        fontFamily: 'Arial, sans-serif',
        padding: '3rem 2rem 2rem',
        borderTop: '1px solid #e5e7eb',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        {/* Logo */}

        {/* Heading */}
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
          Welcome to ThinkMoves
        </h1>

        {/* Description */}
        <p style={{ fontSize: '1.1rem', color: '#4b5563' }}>
          ThinkMoves is your intelligent platform to digitize, analyze, and manage your chess games.
          Upload scoresheets, extract game metadata, validate moves, and save your games with ease.
        </p>

        {/* Feature list */}
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem', color: '#374151', fontSize: '1rem' }}>
          <li>♟️ Extract moves from chess scoresheets</li>
          <li>🧠 Validate moves with real board logic</li>
          <li>📊 Save and manage PGN history</li>
          <li>📷 OCR support for handwritten sheets</li>
        </ul>

        {/* Sign In button */}
        <button
          onClick={handleLogin}
          style={{
            marginTop: '2rem',
            padding: '12px 32px',
            fontSize: '1rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>

        {/* Learn more link */}
        <p style={{ marginTop: '1.5rem' }}>
          <a href="/about" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
            Learn more about ThinkMoves
          </a>
        </p>

        {/* Footer */}
        <footer style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          © 2025 ThinkMoves. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
