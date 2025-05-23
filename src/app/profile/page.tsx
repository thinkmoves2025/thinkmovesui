'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            // Remove local tokens
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');

            // Get Cognito domain and client ID from environment variables
            const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
            const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
            const region = process.env.NEXT_PUBLIC_COGNITO_REGION;

            if (!cognitoDomain || !clientId || !region) {
                console.error('❌ Missing Cognito configuration');
                window.location.href = '/login';
                return;
            }

            // Construct Cognito logout URL
            const logoutUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/logout?` +
                `client_id=${clientId}&` +
                `logout_uri=http://localhost:3000`;

            // Redirect to Cognito logout
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
            } else {
                setIsAuthenticated(false);
                router.push('/login');
            }
        };

        // Delay check slightly to ensure localStorage is available
        const timeout = setTimeout(checkAuth, 100);

        return () => clearTimeout(timeout);
    }, [router]);

    if (!isClient || isAuthenticated === null) {
        return <main>Checking authentication...</main>;
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Profile Page</h1>
            <button 
                onClick={handleLogout} 
                style={{ 
                    marginTop: '2rem',
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
