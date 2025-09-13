// app/[space]/page.tsx
'use client';

import React, {useEffect, useState} from 'react';
import {useUser} from '@/components/UserProvider';
import {createPost, getPosts} from '@/lib/api';

type Post = { id: string | number; title?: string; content?: string; [k: string]: any };

export default function SpacePage({params}: { params: Promise<{ space: string }> }) {
    const {space} = React.use(params);
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const {user} = useUser();

    const load = async () => {
        try {
            const data = await getPosts(space);
            setPosts(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load posts');
        }
    };

    useEffect(() => {
        load();
    }, [space]);

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createPost(space, title.trim(), content.trim(), user?.username ?? 'anon');
        setTitle('');
        setContent('');
        await load();
    };

    return (
        <div>
            <a href="/" style={{color: '#555'}}>← Back</a>
            <h2 style={{fontSize: 22, fontWeight: 600, margin: '8px 0'}}>/s/{space}</h2>

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
                <button type="submit" className={"hover:cursor-pointer border-1 p-2 mb-16"}>Create Post</button>
            </form>

            <ul style={{display: 'grid', gap: 8}}>
                {posts.map((p) => (
                    <li key={String(p.id)} style={{border: '1px solid #eee', padding: 12}}>
                        <a href={`/${encodeURIComponent(space)}/${p.id}`}>
                            <div style={{fontWeight: 600}}>{p.title ?? `Post ${p.id}`}</div>
                            <div style={{color: '#666'}}>{p.content?.slice(0, 140)}</div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
