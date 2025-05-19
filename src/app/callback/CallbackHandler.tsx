'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false); // ✅ Prevent double execution in dev

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const code = searchParams.get('code');
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

    if (!code || !domain || !clientId || !redirectUri) {
      console.error('❌ Missing required values for token exchange.');
      alert('Login failed: Missing code or config');
      return;
    }

    const fetchTokens = async () => {
      try {
        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
        });

        const response = await fetch(`${domain}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data = await response.json();
        console.log('📦 Token Response Data:', data);

        if (data.id_token) {
          localStorage.setItem('id_token', data.id_token);
          localStorage.setItem('access_token', data.access_token);

          // ✅ Dispatch login success event
          window.dispatchEvent(new Event('login-success'));

          console.log('✅ Tokens stored. Redirecting...');
          try {
            router.push('/');
          } catch {
            window.location.href = '/';
          }
        } else {
          console.error('❌ Token fetch failed:', data);
          alert(`Login failed: ${data.error_description || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('❌ Error fetching token:', err);
        alert('Something went wrong during login.');
      }
    };

    fetchTokens();
  }, [searchParams, router]);

  return <main>🔐 Signing you in...</main>;
}
