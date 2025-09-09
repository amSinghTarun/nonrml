// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to your observability tool
    console.error('[Route Error]', error);
  }, [error]);

  const handleRetry = () => {
    // Call Next.js reset (no-op if full reload follows)
    try {
      reset();
    } catch {}
    // Force a full page reload to clear any bad client state
    window.location.reload();
  };

  return (
    <main className="min-h-screen grid place-items-center bg-[#0b0b0b] text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="text-white/70">
          Our team has been notified. Please try again. SOORRRYYY :(
        </p>
        <div className="space-x-3">
          <button
            onClick={handleRetry}
            className="rounded px-4 py-2 bg-white text-black"
          >
            Retry
          </button>
          <a href="/" className="rounded px-4 py-2 border border-white/30">
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}