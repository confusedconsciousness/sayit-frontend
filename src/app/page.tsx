'use client';

import React, {useEffect, useState} from 'react';
import {createSpace, getSpaces} from '@/lib/api';
import {RedirectToSignIn, useAuth} from '@clerk/nextjs';
import Link from 'next/link';
import {Space} from '@/app/lib/types';
import {getCachedData, invalidateCache} from '@/lib/cacheutils';
import {formatTimeAgo} from "@/lib/timeutils";

export default function HomePage() {
    const {isSignedIn, getToken} = useAuth();
    const [redirectToSignIn, setRedirectToSignIn] = React.useState(false);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [newSpace, setNewSpace] = useState('');
    const [desc, setDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const cacheKey = 'spaces';

    const loadSpaces = async () => {
        setIsLoading(true);
        try {
            const data = await getCachedData(cacheKey, getSpaces);
            setSpaces(data);
        } catch (e) {
            console.error('Failed to load spaces:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSpaces();
    }, []);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating || !newSpace.trim()) return;

        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }
        const validName = newSpace.trim();
        if (!/^[a-zA-Z0-9_]+$/.test(validName)) {
            alert(
                "Space names can only contain letters, numbers, and underscores (_). Spaces and special characters are not allowed."
            );
            return;
        }

        setIsCreating(true);
        try {
            const token = (await getToken({template: 'with-username'})) as string;
            await createSpace(validName.toLowerCase(), desc.trim(), token);

            invalidateCache(cacheKey);
            setNewSpace('');
            setDesc('');
            await loadSpaces();
        } catch (err) {
            console.error('Failed to create space:', err);
        } finally {
            setIsCreating(false);
        }
    };

    if (redirectToSignIn) {
        return <RedirectToSignIn redirectUrl={window.location.href}/>;
    }


    return (
        <div>
            <h2 style={{fontSize: 22, fontWeight: 600, marginBottom: 8}}>
                Let&apos;s create a Space for you!
            </h2>

            <form
                onSubmit={onCreate}
                style={{display: 'grid', gap: 8, marginBottom: 16}}
                aria-busy={isCreating}
            >
                <input
                    value={newSpace}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                        setNewSpace(val);
                    }}
                    placeholder="What would you like to call your space?"
                    style={{border: '1px solid #ddd', padding: 8}}
                    disabled={isCreating}
                />

                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Why not explain others what this space is all about?"
                    rows={3}
                    style={{border: '1px solid #ddd', padding: 8}}
                    disabled={isCreating}
                />

                <button
                    type="submit"
                    disabled={isCreating || !newSpace.trim()}
                    className="border-1 p-2 hover:cursor-pointer mb-16 dark:hover:bg-white dark:hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <span className="inline-flex items-center">
              <span
                  className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                  aria-hidden="true"
              />
              Something is brewing... wait is it a Space?
            </span>
                    ) : (
                        'Create'
                    )}
                </button>
            </form>

            <h3 style={{fontSize: 20, fontWeight: 600, marginBottom: 8}}>
                Or explore these existing Spaces:
            </h3>
            {isLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-600">
          <span
              className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
              aria-hidden="true"
          />
                    Loading spaces…
                </div>
            ) : (
                // MODIFIED: Reworked the list to show more details
                <ul style={{display: 'grid', gap: 8}}>
                    {spaces.map((s) => {
                        const displayName = s?.name ?? s?.id;
                        if (!displayName) return null; // Don't render if there's no name/id

                        return (
                            <li key={displayName} className="border border-gray-200 p-3 rounded-md">
                                <Link href={`/${encodeURIComponent(displayName as string)}`}>
                                    <h4 className="font-semibold text-lg hover:underline">/s/{displayName}</h4>
                                    <p className="text-[#666] my-1 text-sm">{s.description}</p>
                                    <div className="text-xs text-[#666]">
                                        created by {s.author ?? 'anon'} • {formatTimeAgo(s.createdAt)}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}