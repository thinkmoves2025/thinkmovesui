'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [gameCount, setGameCount] = useState<number>(0);
    const [positionCount, setPositionCount] = useState<number>(0);
    const [contributionCount, setContributionCount] = useState<number>(0);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');

            const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
            const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
            const region = process.env.NEXT_PUBLIC_COGNITO_REGION;

            if (!cognitoDomain || !clientId || !region) {
                console.error('❌ Missing Cognito configuration');
                window.location.href = '/login';
                return;
            }

            const logoutUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/logout?` +
                `client_id=${clientId}&logout_uri=http://localhost:3000`;

            window.location.href = logoutUrl;
        }
    };

    useEffect(() => {
        setIsClient(true);

        const checkAuth = () => {
            const idToken = localStorage.getItem('id_token');
            const accessToken = localStorage.getItem('access_token');

            if (idToken && accessToken) {
                setIsAuthenticated(true);
                fetchCounts(accessToken);
            } else {
                setIsAuthenticated(false);
                router.push('/login');
            }
        };

        const timeout = setTimeout(checkAuth, 100);
        return () => clearTimeout(timeout);
    }, [router]);

    const fetchCounts = async (accessToken: string) => {
        try {
            const response = await axios.get(
                'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Profile/PlayerSavedItemsCount',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = response.data;
            setGameCount(data.savedGameCount || 0);
            setPositionCount(data.savedPositionCount || 0);
            setContributionCount(data.contributions || 0);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    if (!isClient || isAuthenticated === null) {
        return <main>Checking authentication...</main>;
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Profile Page</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', color: '#333' }}>Games Saved</h2>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gameCount}</p>
                </div>
                <div style={{ backgroundColor: '#fffaf0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', color: '#333' }}>Positions Saved</h2>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{positionCount}</p>
                </div>
                <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', color: '#333' }}>Contributions</h2>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{contributionCount}</p>
                </div>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Logout
            </button>
        </main>
    );
}
