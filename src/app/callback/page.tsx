'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      console.log("📥 Received code from Cognito redirect:", code);

      if (!code) {
        console.error('❌ No authorization code found in URL');
        return;
      }

      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
      const redirectUri =
        window.location.hostname === 'localhost'
          ? 'http://localhost:3000/callback'
          : 'https://thinkmovesui.vercel.app/callback';

      console.log("📦 Sending token exchange request with:", {
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      });

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      });


      try {
        const response = await fetch(`${domain}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });

        const data = await response.json();

        if (response.ok && data.id_token) {
          localStorage.setItem('id_token', data.id_token);
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);

          window.dispatchEvent(new Event('login-success'));
          router.push('/');
        } else {
          console.error('❌ Token exchange failed:', {
            status: response.status,
            statusText: response.statusText,
          body: data,
          });
        }
      } catch (error) {
        console.error('❌ Error exchanging code:', error);
      }
    };

    exchangeCodeForToken();
  }, [router]);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Signing you in...</h1>
    </main>
  );
}
