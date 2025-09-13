// app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
    title: 'Sayit',
    description: 'Spaces, posts, and nested comments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Sayit</h1>
            {children}
        </div>
        </body>
        </html>
    );
}
