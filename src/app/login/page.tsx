'use client';
import Image from 'next/image';

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

// Updated ThinkMoves Landing Page React Component
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
    <style>
      {`
        .top-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .top-buttons {
            position: absolute;
            top: 1.5rem;
            right: 2rem;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            margin-bottom: 0;
          }
        }

        .top-button {
          padding: 10px 20px;
          font-size: 0.95rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          width: 220px;
          max-width: 90%;
          text-align: center;
        }

        .get-started {
          background-color: #3b82f6;
          color: #fff;
        }

        .download-sheets {
          background-color: #10b981;
          color: #fff;
          text-decoration: none;
        }
      `}
    </style>

    {/* Top-right buttons */}
    <div className="top-buttons">
      <button onClick={handleLogin} className="top-button get-started">
        Get Started Free
      </button>
      <a
        href="/downloads/ThinkMovesEmpty.zip"
        download
        className="top-button download-sheets"
      >
        Download Blank Sheets
      </a>
    </div>

    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      {/* App Name */}
      <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
        ThinkMoves
      </h1>

      {/* Why ThinkMoves Section */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
        Why ThinkMoves?
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '2rem' }}>
        Most chess players still record their games on paper — but reviewing them later is slow, error-prone, and tedious. ThinkMoves turns any scanned scoresheet into a structured, editable PGN with move validation, corrections, and easy sharing.
      </p>

      {/* Step-by-step flow with arrows */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {[
          { icon: '📤', title: 'Upload Scoresheet', desc: 'Upload a scanned image of your game' },
          { icon: '🧠', title: 'Auto Analysis', desc: 'AI extracts moves and metadata' },
          { icon: '🛠️', title: 'Fix Mistakes', desc: 'Manually correct OCR errors' },
          { icon: '🔄', title: 'Recheck Moves', desc: 'Validate with board logic' },
          { icon: '💾', title: 'Save Your Game', desc: 'Store PGN and positions securely' },
          { icon: '♟️', title: 'Share or Replay', desc: 'Continue, replay, or export' },
        ].map((step, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: '12px',
                width: '180px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.8rem' }}>{step.icon}</div>
              <h3 style={{ fontWeight: 'bold', marginTop: '0.5rem', fontSize: '1.1rem' }}>{step.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{step.desc}</p>
            </div>
            {i !== arr.length - 1 && (
              <div style={{ fontSize: '1.5rem', margin: '0 0.5rem' }}>➡️</div>
            )}
          </div>
        ))}
      </div>

      {/* Blank Scoresheet Preview */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Blank Scoresheets Preview
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ maxWidth: '400px', borderRadius: '10px', overflow: 'hidden' }}>
            <Image src="/ThinkMoves_empty/ThinkMovesFront.jpg" alt="Front Scoresheet" width={400} height={565} />
          </div>

          <Image src="/ThinkMoves_empty/ThinkMovesBack.jpg" alt="Back Scoresheet" width={400} height={565} />
        </div>

        <a
          href="/downloads/ThinkMovesEmpty.zip"
          download
          style={{
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          Download Blank Sheets
        </a>
      </div>

      {/* Coming Soon Section */}
      <div style={{ marginTop: '4rem', padding: '2rem', background: '#f0fdf4', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857', marginBottom: '1rem' }}>
          Coming Soon to ThinkMoves
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, color: '#065f46', fontSize: '1rem' }}>
          <li>🕰️ Bluetooth Chess Clock Integration</li>
          <li>📊 Game Insights and Accuracy Scoring</li>
          <li>📱 Mobile App for On-the-Go Uploads</li>
          <li>📖 Custom Printable Scorebooks</li>
        </ul>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '2rem' }}>
        No credit card needed. Just upload and play.
      </p>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#4b5563' }}>
        🔒 <strong>Private and Secure:</strong> Your games are saved safely. No spam. No ads.
      </div>

      <footer style={{ marginTop: '3rem', fontSize: '0.8rem', color: '#9ca3af' }}>
        © 2025 ThinkMoves. All rights reserved.
      </footer>
    </div>
  </main>
);



}
