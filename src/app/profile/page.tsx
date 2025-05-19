'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

export default function ProfilePage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');
            const logoutUri = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI || '/login';
            window.location.href = logoutUri;
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

    const DynamicInteractiveCard = dynamic(() => import('../components/InteractiveCard'), {
        ssr: false,
    });

    if (!isClient || isAuthenticated === null) {
        return <main>Checking authentication...</main>;
    }

    return (
        <div>
            <h1>Profile Page</h1>
            <DynamicInteractiveCard onClick={handleLogout} />
        </div>
    );
}
