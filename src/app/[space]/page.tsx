// app/[space]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPost, getPosts, getSpace } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Post, Space } from '@/app/lib/types';
import Link from 'next/link';

export default function SpacePage({ params }: { params: Promise<{ space: string }> }) {
    const { getToken } = useAuth();
    const { space } = React.use(params);

    const [spaceInfo, setSpaceInfo] = useState<Space>({});
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // NEW

    const load = async () => {
        setIsLoading(true); // NEW
        try {
            const data = await getPosts(space);
            setPosts(data);
            const spaceData = await getSpace(space);
            setSpaceInfo(spaceData);
        } catch (e) {
            console.error(e);
            alert('Failed to load posts');
        } finally {
            setIsLoading(false); // NEW
        }
    };

    useEffect(() => {
        load();
    }, [space]);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isCreatingPost) return;
        setIsCreatingPost(true);
        try {
            const token = (await getToken({ template: 'with-username' })) as string;
            await createPost(space, title.trim(), content.trim(), token);
            setTitle('');
            setContent('');
            await load(); // will show spinner again while reloading
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsCreatingPost(false);
        }
    };

    return (
        <div>
            <Link href="/" style={{ color: '#555' }}>← Back</Link>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '8px 0' }}>/s/{space}</h2>
            <div className="mt-2 mb-4 text-[#666]">{spaceInfo.description}</div>

            <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What is on your mind?"
                    style={{ border: '1px solid #ddd', padding: 8 }}
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Description (optional)"
                    rows={4}
                    style={{ border: '1px solid #ddd', padding: 8 }}
                />
                <button
                    type="submit"
                    disabled={isCreatingPost || !title.trim()}
                    className="hover:cursor-pointer border-1 p-2 mb-16 dark:hover:bg-white dark:hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingPost ? (
                        <span className="inline-flex items-center">
              <span
                  className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                  aria-hidden="true"
              />
              Creating...
            </span>
                    ) : (
                        'Create Post'
                    )}
                </button>
            </form>

            {isLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-600">
          <span
              className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
              aria-hidden="true"
          />
                    Loading posts…
                </div>
            ) : (
                <ul style={{ display: 'grid', gap: 8 }}>
                    {posts.map((p) => (
                        <li key={String(p.id)} style={{ border: '1px solid #eee', padding: 12 }}>
                            <Link href={`/${encodeURIComponent(space)}/${p.id}`}>
                                <div style={{ fontWeight: 600 }}>{p.title ?? `Post ${p.id}`}</div>
                                <div style={{ color: '#666' }}>{p.content?.slice(0, 140)}</div>
                                <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
                                    by {p.author ?? 'anon'} • ▲{p.upvotes ?? 0} ▼{p.downvotes ?? 0}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
