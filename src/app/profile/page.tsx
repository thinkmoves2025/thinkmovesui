'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState({
    playerName: 'Ashay K.',
    rating: '-',
    totalGamesSaved: '-',
    totalPositionsSaved: '-',
    totalContribsSubmitted: '-',
  });

  const handleLogout = () => {
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const logoutUri = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI;

    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('correctMoves');  
    localStorage.removeItem('remainingMoves'); 
    localStorage.removeItem('blackPlayer'); 
    localStorage.removeItem('whitePlayer'); 
    localStorage.removeItem('blackRating'); 
    localStorage.removeItem('whiteRating'); 
    localStorage.removeItem('board'); 
    localStorage.removeItem('round'); 

    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    window.location.href = logoutUrl;
  };

  useEffect(() => {
    setIsClient(true);

    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('id_token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);

      try {
        const response = await axios.post(
          'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Profile/GetProfileDetails',
          null,
        {   
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setProfileData(prev => ({
          ...prev,
          rating: data.rating ?? '-',
          totalGamesSaved: data.totalGamesSaved ?? '-',
          totalPositionsSaved: data.totalPositionsSaved ?? '-',
          totalContribsSubmitted: data.totalContribsSubmitted ?? '-',
        }));
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      }
    };

    const timeout = setTimeout(checkAuthAndFetch, 100);
    return () => clearTimeout(timeout);
  }, [router]);

  if (!isClient || isAuthenticated === null) {
    return <main style={{ padding: '2rem' }}>Checking authentication...</main>;
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
        Profile Page
      </h1>

      {/* Profile Info */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8', fontSize: '1rem', color: '#374151' }}>
          <li><strong>⭐ Player Rating:</strong> {profileData.rating}</li>
          <li><strong>🎯 Games Saved:</strong> {profileData.totalGamesSaved}</li>
          <li><strong>♟ Positions Saved:</strong> {profileData.totalPositionsSaved}</li>
          <li><strong>💡 Contributions:</strong> {profileData.totalContribsSubmitted}</li>
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Logout
      </button>

<br /><br />
      {/* Gameplay Insights */}
<div
  style={{
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  }}
>
  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
    ♟️ Gameplay Insights
  </h2>
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8', fontSize: '1rem', color: '#374151' }}>
    <li><strong>📘 Most Played Opening:</strong> Sicilian Defense (B20)</li>
    <li><strong>📊 Win/Loss/Draw:</strong> 3 Wins | 2 Losses | 2 Draws</li>
    <li><strong>⚪ Win Rate as White:</strong> 60% (3/5)</li>
    <li><strong>⚫ Win Rate as Black:</strong> 33% (1/3)</li>
    <li><strong>📏 Avg. Game Length:</strong> 32 moves</li>
  </ul>
</div>

{/* Advanced Stats */}
<div
  style={{
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  }}
>
  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
    📈 Advanced Stats
  </h2>
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8', fontSize: '1rem', color: '#374151' }}>
    <li><strong>🔍 Blunders per Game:</strong> 1.6</li>
    <li><strong>💯 Best Game Accuracy:</strong> 92%</li>
    <li><strong>❗ Game Mistake Summary:</strong> Blunders: 5 | Mistakes: 8 | Inaccuracies: 12</li>

    <li><strong>⏱️ Rapid Win Rate:</strong> 55%</li>
    <li><strong>⚡ Blitz Win Rate:</strong> 40%</li>
    <li><strong>🔥 Bullet Win Rate:</strong> 20%</li>

    <li><strong>📘 Opening Stats:</strong> Sicilian (65% win) | French (20% win)</li>

    <li><strong>🏁 Endgame Conversion:</strong> Won: 70% | Drawn: 20% | Lost: 10%</li>

    <li><strong>📊 Game Quality Trend:</strong> Accuracy ↑ 12% over last 10 games</li>

    <li><strong>🌐 Opening Diversity:</strong> 4 as White | 2 as Black</li>
  </ul>
</div>

    </main>
  );
}
