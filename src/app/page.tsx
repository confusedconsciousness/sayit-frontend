'use client';

import React, { useEffect, useState } from 'react';
import { createSpace, getSpaces } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

type Space = { id?: string | number; name?: string; description?: string };

export default function HomePage() {
    const { getToken } = useAuth();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [newSpace, setNewSpace] = useState('');
    const [desc, setDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const load = async () => {
        try {
            const data = await getSpaces();
            setSpaces(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating) return; // guard against double submit
        if (!newSpace.trim()) return;

        setIsCreating(true);
        try {
            const token = (await getToken({ template: 'with-username' })) as string;
            await createSpace(newSpace.trim(), desc.trim(), token);
            setNewSpace('');
            setDesc('');
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Spaces</h2>

            <form
                onSubmit={onCreate}
                style={{ display: 'grid', gap: 8, marginBottom: 16 }}
                aria-busy={isCreating}
            >
                <input
                    value={newSpace}
                    onChange={(e) => setNewSpace(e.target.value)}
                    placeholder="Let's create a new Space for you!"
                    style={{ border: '1px solid #ddd', padding: 8 }}
                    disabled={isCreating}
                />

                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Why not explain others what this space is all about?"
                    rows={3}
                    style={{ border: '1px solid #ddd', padding: 8 }}
                    disabled={isCreating}
                />

                <button
                    type="submit"
                    disabled={isCreating || !newSpace.trim()}
                    className="border-1 p-2 hover:cursor-pointer mb-16 dark:hover:bg-white dark:hover:text-black transition-colors duration-300"
                >
                    {isCreating ? 'Creating…' : 'Create'}
                </button>
            </form>

            <ul style={{display: 'grid', gap: 8}}>
                {spaces.map((s) => {
                    const display = s?.name ?? s?.id ?? JSON.stringify(s);
                    return (
                        <li key={display} className={"border border-[#eee] p-2 flex"} >
                            <Link className={'w-full'} href={`/${encodeURIComponent(display as string)}`}>/s/{display}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
