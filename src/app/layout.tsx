// app/layout.tsx
import './globals.css';
import React from 'react';
import type {Metadata} from "next";
import {ClerkProvider, UserButton} from "@clerk/nextjs";
import {UserProvider} from "@/components/UserProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
    title: 'Sayit - It\'s your Space',
    description: 'Spaces, posts, and nested comments',
    icons: {
        icon: "/favicon.png"
    }
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <ClerkProvider appearance={{cssLayerName: 'clerk'}}>
            <html lang="en">
            <body style={{fontFamily: 'ui-sans-serif, system-ui', padding: 24}}>
            <div style={{maxWidth: 900, margin: '0 auto'}}>

                <div className={"flex justify-between align-middle mb-4"}>
                    <Header/>
                    <UserButton/>
                </div>
                <UserProvider>
                    {children}
                </UserProvider>
            </div>
            </body>
            </html>

        </ClerkProvider>
    );
}
