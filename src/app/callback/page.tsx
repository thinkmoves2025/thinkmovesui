'use client';

import dynamic from 'next/dynamic';

// Prevents SSR on callback logic
const CallbackHandler = dynamic(() => import('./CallbackHandler'), { ssr: false });

export default function CallbackPage() {
  return <CallbackHandler />;
}
