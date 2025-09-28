'use client';

import React, {useEffect, useState} from 'react';
import {createPost, getPosts, getSpace} from '@/lib/api';
import {RedirectToSignIn, useAuth} from '@clerk/nextjs';
import {Post, Space} from '@/app/lib/types';
import Link from 'next/link';
import {getCachedData, invalidateCache} from "@/lib/cacheutils";
import {redirect} from 'next/navigation';
import {formatTimeAgo} from "@/lib/timeutils";
import {FaRegComment} from "react-icons/fa";

function getCachedPosts(space: string): Promise<Post[]> {
    return getCachedData<Post[]>(`posts_${space}`, () => getPosts(space));
}

function getCachedSpace(space: string): Promise<Space> {
    return getCachedData<Space>(`space_${space}`, () => getSpace(space));
}

export default function SpacePage({params}: { params: Promise<{ space: string }> }) {
    const {isSignedIn, getToken} = useAuth();
    const {space} = React.use(params);

    const [redirectToSignIn, setRedirectToSignIn] = React.useState(false);

    const [spaceInfo, setSpaceInfo] = useState<Space>({});
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        try {
            const [postData, spaceData] = await Promise.all([
                getCachedPosts(space),
                getCachedSpace(space),
            ]);
            setPosts(postData);
            setSpaceInfo(spaceData);
        } catch (e) {
            console.error(e);
            redirect('/');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [space]);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isCreatingPost) return;

        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }

        setIsCreatingPost(true);
        try {
            const token = (await getToken({template: 'with-username'})) as string;
            await createPost(space, title.trim(), content.trim(), token);
            setTitle('');
            setContent('');

            invalidateCache(`posts_${space}`)
            await load();
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsCreatingPost(false);
        }
    };

    if (redirectToSignIn) {
        return <RedirectToSignIn redirectUrl={window.location.href}/>;
    }

    return (
        <div>
            <Link href="/" style={{color: '#555'}}>← Back</Link>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                    margin: '8px 0',
                }}
            >
                <h2 style={{fontSize: 22, fontWeight: 600, margin: '8px 0'}}>/s/{space}</h2>

                <div style={{fontSize: 15, color: '#888', flexShrink: 0}}>
                    by {spaceInfo.author ?? 'anon'} • {formatTimeAgo(spaceInfo.createdAt)}
                </div>
            </div>
            <div className="mt-2 mb-4 text-[#666]">{spaceInfo.description}</div>

            <form onSubmit={onCreate} style={{display: 'grid', gap: 8, marginBottom: 16}}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What is on your mind?"
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Description (optional)"
                    rows={4}
                    style={{border: '1px solid #ddd', padding: 8}}
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
                <ul style={{display: 'grid', gap: 8}}>
                    <h2 className={'font-bold text-lg'}>Recent Posts: </h2>
                    {posts.map((p) => (
                        <li key={String(p.id)}
                            className={'border-1 border-[#555] p-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200 rounded-md'}>
                            <Link href={`/${encodeURIComponent(space)}/${p.id}`}>
                                <div style={{color: '#888', fontSize: 13, marginTop: 6}}>
                                    {p.author ?? 'anon'} • {formatTimeAgo(p.createdAt)}

                                </div>
                                <h4 className={'font-semibold'}>{p.title ?? `Post ${p.id}`}</h4>
                                <div className={'text-[#888] text-sm my-1'}>{p.content?.slice(0, 140)}</div>
                                <div className="flex items-center gap-4 mt-2">
                                    <div
                                        className={'max-w-max px-3 py-1 bg-[#EEE] dark:bg-zinc-800 text-[#555] dark:text-zinc-400 text-xs font-bold rounded-full'}>
                                        ▲ {p.upvotes ?? 0 } ▼ {p.downvotes ?? 0}
                                    </div>
                                    <div className={'flex items-center text-sm text-gray-500'}>
                                        <FaRegComment className="mr-1.5"/>
                                        {p.comments?.length ?? 0}
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}