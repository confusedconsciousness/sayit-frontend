// app/layout.tsx
import './globals.css';
import React from 'react';
import type {Metadata} from "next";
import {ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";
import Header from "@/components/Header";

export const metadata: Metadata = {
    title: 'Sayit - It\'s your Space',
    description: 'A place where you can be yourself, share your thoughts, and connect with others.',
    icons: {
        icon: "/favicon.png"
    },
    openGraph: {
        title: 'Sayit - It\'s your Space',
        description: 'A place where you can be yourself, share your thoughts, and connect with others.',
        images: [
            {
                url: '/favicon.png',
                width: 800,
                height: 600,
            },
        ],
        siteName: 'Sayit'
    }
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <ClerkProvider appearance={{cssLayerName: 'clerk'}}>
            <html lang="en">
            <body style={{fontFamily: 'ui-sans-serif, system-ui', padding: 24}}>
            <meta
                property={"og:image"}
                content={"/favicon.png"}
            />
            <div style={{maxWidth: 900, margin: '0 auto'}}>

                <header className={"flex justify-between items-center mb-4"}>
                    <Header/>
                    <div>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: {
                                    userButtonAvatarBox: {
                                        width: "2.5rem",
                                        height: "2.5rem"
                                    }
                                }
                            }}/>
                        </SignedIn>
                        <SignedOut>
                            {/* This button is shown to signed-out users */}
                            <SignInButton mode="modal">
                                <button
                                    className="dark:bg-white dark:text-slate-700 cursor-pointer hover:dark:bg-zinc-200 dark:hover:text-black bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </header>

                <main>
                    {children}
                </main>
            </div>
            </body>
            </html>
        </ClerkProvider>
    );
}