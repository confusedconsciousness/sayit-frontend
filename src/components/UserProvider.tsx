// components/UserProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = { email: string; name: string; username: string };

type Ctx = {
    user: User | null;
    login: (u: User) => void;
    logout: () => void;
};

const UserContext = createContext<Ctx | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Load from localStorage on first client render
    useEffect(() => {
        try {
            const raw = localStorage.getItem('demo:user');
            if (raw) setUser(JSON.parse(raw));
        } catch {}
    }, []);

    const login = (u: User) => {
        setUser(u);
        localStorage.setItem('demo:user', JSON.stringify(u));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('demo:user');
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
