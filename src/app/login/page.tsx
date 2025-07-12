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

    {/* Top-right buttons */}
  <div
    style={{
      position: 'absolute',
      top: '1.5rem',
      right: '2rem',
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    }}
  >
    <button
      onClick={handleLogin}
      style={{
        padding: '10px 20px',
        fontSize: '0.95rem',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      Get Started Free
    </button>

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      {/* App Name */}
      <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
        ThinkMoves
      </h1>

      {/* Punchline */}
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#1f2937' }}>
        Digitize Your Chess Scoresheets with Ease
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '2rem' }}>
        ThinkMoves converts your paper scoresheets into smart, editable digital games.
        Validate moves, correct errors, and save your PGN — all in one place.
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

<div style={{ textAlign: 'center', marginTop: '3rem' }}>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
    Blank Scoresheets Preview
  </h2>

  {/* Image Previews in Grid */}
  <div style={{
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '2rem',
  marginBottom: '2rem'
}}>
  <div style={{ maxWidth: '400px', borderRadius: '10px', overflow: 'hidden' }}>
<Image
  src="/ThinkMoves_empty/ThinkMovesFront.jpg"
  alt="Back Scoresheet"
  width={400}
  height={565}
/>

  </div>

<Image
  src="/ThinkMoves_empty/ThinkMovesBack.jpg"
  alt="Back Scoresheet"
  width={400}
  height={565}
/>

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

<br /><br />
</div>


      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
        No credit card needed. Just upload and play.
      </p>

      {/* Trust note */}
      <div style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
        🔒 <strong>Private and Secure:</strong> Your games are saved safely. No spam. No ads.
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#9ca3af' }}>
        © 2025 ThinkMoves. All rights reserved.
      </footer>
    </div>
  </main>
);


}
