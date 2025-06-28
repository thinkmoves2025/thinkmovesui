'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const code = searchParams.get('code');
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    const redirectUri = `${window.location.origin}/callback`; // ✅ dynamic

    if (!code || !domain || !clientId) {
      console.error('❌ Missing required Cognito config or code.');
      alert('Login failed due to missing configuration.');
      return;
    }

    const fetchTokens = async () => {
      try {
        const tokenParams = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri, // ✅ matches login url exactly
        });

        const tokenRes = await fetch(`${domain}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.id_token) {
          throw new Error(tokenData.error_description || 'Token not received');
        }

        localStorage.setItem('id_token', tokenData.id_token);
        localStorage.setItem('access_token', tokenData.access_token);

        // Save player info
        const savePlayerRes = await fetch('https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Player/SavePlayerDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.id_token}`
          },
          body: JSON.stringify({})
        });

        const raw = await savePlayerRes.text();
        let saveResponse = '';

        try {
          const parsed = JSON.parse(raw);
          saveResponse = typeof parsed === 'string' ? parsed : parsed.savePlayerResponseVar;
        } catch (err) {
          console.error('❌ Parsing SavePlayerDetails response failed:', err);
        }

        console.log('🎯 SavePlayer Response:', saveResponse);

        if (saveResponse === 'Player saved successfully' || saveResponse === 'Player already exists') {
          window.dispatchEvent(new Event('login-success'));
        }

        router.push('/');
      } catch (err) {
        console.error('❌ Callback Error:', err);
        alert('Login failed. Please try again.');
        router.push('/');
      }
    };

    fetchTokens();
  }, [searchParams, router]);

  return <main>🔐 Signing you in...</main>;
}
