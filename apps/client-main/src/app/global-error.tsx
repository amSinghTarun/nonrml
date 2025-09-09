// app/global-error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Optional: log error
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  const handleReset = () => {
    // Call Next.js reset (in case you switch to soft reset later)
    try {
      reset();
    } catch {}
    // Force a full page reload to clear any bad client state
    window.location.reload();
  };

  return (
    <html>
      <body>
        <main className="min-h-screen grid place-items-center bg-black text-white">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-semibold">We hit a snag</h1>
            <p className="text-white/70">Please try again. SORRRYYYY :(</p>
            <div className="space-x-3">
              <button
                onClick={handleReset}
                className="rounded px-4 py-2 bg-white text-black"
              >
                Retry
              </button>
              <a href="/">Home</a>
            </div>
            {/* <code className="opacity-50 text-xs">{error.digest}</code> */}
          </div>
        </main>
      </body>
    </html>
  );
}