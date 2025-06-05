'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
//import { jwtDecode } from 'jwt-decode';

/*interface CognitoJwtPayload {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}*/

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
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

    if (!code || !domain || !clientId || !redirectUri) {
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
          redirect_uri: redirectUri,
        });

        const tokenRes = await fetch(`${domain}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        const tokenData = await tokenRes.json();
        //console.log('📦 Token Data:', tokenData);

        if (!tokenData.id_token) {
          throw new Error(tokenData.error_description || 'Token not received');
        }

        localStorage.setItem('id_token', tokenData.id_token);
        localStorage.setItem('access_token', tokenData.access_token);

        try {
          //const decoded = jwtDecode<CognitoJwtPayload>(tokenData.id_token);
          //console.log('✅ Decoded Token:', decoded);
        } catch (decodeErr) {
          console.warn('⚠️ Failed to decode token:', decodeErr);
        }

        // ✅ Authenticated call to SavePlayerDetails (no body needed)
        const savePlayerRes = await fetch('https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Player/SavePlayerDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.id_token}`
          },
          body: JSON.stringify({}) // can be removed if your controller accepts no body
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
