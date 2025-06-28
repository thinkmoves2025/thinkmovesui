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
    </main>
  );
}
