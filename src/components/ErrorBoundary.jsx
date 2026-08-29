import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" style={{ width: 48, marginBottom: 24 }}>
          <rect width="32" height="32" rx="8" fill="var(--color-text-primary)"/>
          <path d="M8 22V10h4.2c2.8 0 4.6 1.5 4.6 3.9 0 1.6-.8 2.8-2.1 3.4l3.1 4.7h-2.9l-2.7-4.2H10.2V22H8zm2.2-6h1.9c1.4 0 2.2-.7 2.2-1.8S13.5 12 12 12h-1.8v4z" fill="#fff"/>
          <circle cx="22" cy="16" r="5" stroke="var(--color-accent)" strokeWidth="2"/>
        </svg>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Något gick fel</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 24, maxWidth: 320 }}>
          Ett oväntat fel uppstod. Prova att ladda om sidan.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Ladda om
        </button>
      </div>
    );
  }
}
