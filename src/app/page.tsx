'use client';

import React, {useEffect, useState} from 'react';
import {useUser} from '@/components/UserProvider';
import {createSpace, getSpaces} from '@/lib/api';

type Space = { id?: string | number; name?: string; description?: string };

export default function HomePage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [newSpace, setNewSpace] = useState('');
    const [desc, setDesc] = useState('');
    const {user} = useUser();
    const load = async () => {
        try {
            const data = await getSpaces();
            setSpaces(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load spaces');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSpace.trim()) return;
        await createSpace(newSpace.trim(), user?.username ?? 'anon', desc.trim());
        setNewSpace('');
        setDesc('');
        await load();
    };

    return (
        <div>
            <h2 style={{fontSize: 22, fontWeight: 600, marginBottom: 8}}>Spaces</h2>

            <form onSubmit={onCreate} style={{display: 'grid', gap: 8, marginBottom: 16}}>
                <input
                    value={newSpace}
                    onChange={(e) => setNewSpace(e.target.value)}
                    placeholder="Let's create a new Space for you!"
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Why not explain others what this space is all about?"
                    rows={3}
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <button type="submit" className="border-1 p-2 hover:cursor-pointer mb-16">Create</button>
            </form>

            <ul style={{display: 'grid', gap: 8}}>
                {spaces.map((s) => {
                    const display = s?.name ?? s?.id ?? JSON.stringify(s);
                    return (
                        <li key={display} style={{border: '1px solid #eee', padding: 12}}>
                            <a href={`/${encodeURIComponent(display as string)}`}>/s/{display}</a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
