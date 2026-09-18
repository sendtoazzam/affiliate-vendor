'use client';

import React from 'react';
import ErrorPage from './error';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="vamoflex">
      <body>
        <ErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}