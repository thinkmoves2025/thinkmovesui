'use client';

export default function LoginPage() {
  const handleLogin = () => {
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

    if (typeof window !== 'undefined' && domain && clientId && redirectUri) {
      const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = loginUrl;
    } else {
      console.error('Missing env vars or not in browser');
    }
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Login</h1>
      <button onClick={handleLogin} style={{ marginTop: '1rem', padding: '10px 20px' }}>
        Sign in with Cognito
      </button>
    </main>
  );
}
