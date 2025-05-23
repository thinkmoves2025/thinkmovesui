'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface CognitoJwtPayload {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  savePlayerResponseVar: string;
}

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
          try {
            const decodedToken = jwtDecode<CognitoJwtPayload>(data.id_token);
            console.log('📦 Decoded JWT Token:', decodedToken);
          } catch (decodeError) {
            console.error('❌ Error decoding JWT:', decodeError);
          }

          localStorage.setItem('id_token', data.id_token);
          localStorage.setItem('access_token', data.access_token);

          try {
            const response = await fetch('https://sjmpwxhxms.us-east-1.awsapprunner.com/Player/SavePlayerDetails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken: data.id_token })
            });

            const rawResponse = await response.text();
            let parsedResponse: ApiResponse;

            try {
              const initialParse = JSON.parse(rawResponse);
              if (typeof initialParse === 'string') {
                parsedResponse = JSON.parse(initialParse);
              } else if (initialParse && typeof initialParse === 'object' && 'savePlayerResponseVar' in initialParse) {
                parsedResponse = initialParse;
              } else {
                throw new Error('Invalid response format');
              }
            } catch (parseError) {
              console.error('❌ Error parsing API response:', parseError);
              parsedResponse = { savePlayerResponseVar: '' };
            }

            console.log('Parsed API Response:', parsedResponse);

            const result = parsedResponse.savePlayerResponseVar;
            if (result === 'Player saved successfully' || result === 'Player already exists') {
              window.dispatchEvent(new Event('login-success'));
              console.log('✅ Player exists or saved. Redirecting...');
              router.push('/');
            } else {
              console.warn('ℹ️ Unexpected response. Continuing anyway.');
              router.push('/');
            }
          } catch (apiError) {
            console.error('❌ Error saving player details:', apiError);
            router.push('/');
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
