// app/[space]/page.tsx
'use client';

import React, {useEffect, useState} from 'react';
import {createPost, getPosts, getSpace} from '@/lib/api';
import {useAuth} from "@clerk/nextjs";
import {Post, Space} from "@/app/lib/types";
import Link from "next/link";


export default function SpacePage({params}: { params: Promise<{ space: string }> }) {
    const {getToken} = useAuth();
    const {space} = React.use(params);

    const [spaceInfo, setSpaceInfo] = useState<Space>({});
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const load = async () => {
        try {
            const data = await getPosts(space);
            setPosts(data);
            // fetch space data as well
            const spaceData = await getSpace(space);
            setSpaceInfo(spaceData)
        } catch (e) {
            console.error(e);
            alert('Failed to load posts');
        }
    };

    useEffect(() => {
        load().then(r => console.log(r));
    }, [space]);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken({template: 'with-username'}) as string;
        if (!title.trim()) return;
        await createPost(space, title.trim(), content.trim(), token);
        setTitle('');
        setContent('');
        await load();
    };

    return (
        <div>
            <Link href="/" style={{color: '#555'}}>← Back</Link>
            <h2 style={{fontSize: 22, fontWeight: 600, margin: '8px 0'}}>/s/{space}</h2>
            <div className={"mt-2 mb-4 text-[#666]"}>{spaceInfo.description}</div>
            <form onSubmit={onCreate} style={{display: 'grid', gap: 8, marginBottom: 16}}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title"
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Post Content"
                    rows={4}
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <button type="submit"
                        className={"hover:cursor-pointer border-1 p-2 mb-16 dark:hover:bg-white dark:hover:text-black transition-colors duration-300"}>Create
                    Post
                </button>
            </form>

            <ul style={{display: 'grid', gap: 8}}>
                {posts.map((p) => (
                    <li key={String(p.id)} style={{border: '1px solid #eee', padding: 12}}>
                        <Link href={`/${encodeURIComponent(space)}/${p.id}`}>
                            <div style={{fontWeight: 600}}>{p.title ?? `Post ${p.id}`}</div>
                            <div style={{color: '#666'}}>{p.content?.slice(0, 140)}</div>
                            <div style={{color: '#888', fontSize: 13, marginTop: 6}}>
                                by {p.author ?? 'anon'} • ▲{p.upvotes ?? 0} ▼{p.downvotes ?? 0}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
