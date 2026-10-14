'use client'

// Last resort: the root layout itself crashed, so no providers, fonts or styles can be assumed. It
// renders its own <html> and <body> with plain inline styles and offers a reload.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <main>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1.25rem', color: '#475569' }}>
            AidBridge could not start. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              minHeight: 44,
              padding: '0 1.25rem',
              borderRadius: 8,
              border: 0,
              background: '#e51f26',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
