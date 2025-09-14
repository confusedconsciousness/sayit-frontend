// app/layout.tsx
import './globals.css';
import React from 'react';
import {UserProvider} from "@/components/UserProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Sayit - It\'s your Space',
    description: 'Spaces, posts, and nested comments',
    icons: {
        icon: "/favicon.png"
    }
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body style={{fontFamily: 'ui-sans-serif, system-ui', padding: 24}}>
        <div style={{maxWidth: 900, margin: '0 auto'}}>
            <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <a href="/">Home</a>
                <a href="/auth">Auth</a>
            </nav>
            <UserProvider>
                <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 16}}>Sayit - It's your Space</h1>
                {children}
            </UserProvider>
        </div>
        </body>
        </html>
    );
}
