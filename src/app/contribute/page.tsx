// app/contribute/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ContributePage() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
        setToken(storedToken);
    }, []);

    return (
        <div>
            <h1>Contribute Page</h1>
            {token ? (
                <div>
                    {/* Contribution form or content for authenticated users */}
                    <p>You are authenticated to contribute.</p>
                </div>
            ) : (
                <div>
                    <p>Please log in to contribute.</p>
                </div>
            )}
        </div>
    );
}
