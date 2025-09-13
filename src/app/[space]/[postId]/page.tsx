'use client';

import {useUser} from '@/components/UserProvider';
import React, {useEffect, useState} from 'react';
import {addComment, addReply, getPost, getReplies} from '@/lib/api';

type Comment = {
    id: string | number;
    comment?: string;
    author?: string;
    comments?: Comment[];
    [k: string]: any;
};

type Post = {
    id: string | number;
    title?: string;
    content?: string;
    comments?: Comment[]; // assuming backend may return top-level comments with the post
    [k: string]: any;
};

export default function PostPage({params}: { params: Promise<{ space: string; postId: string }> }) {
    const {user} = useUser();
    const {space, postId} = React.use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [topComment, setTopComment] = useState('');

    const load = async () => {
        try {
            const data = await getPost(space, postId);
            setPost(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load post');
        }
    };

    useEffect(() => {
        load().then(r => console.log(r));
    }, [space, postId]);

    const submitTopComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topComment.trim()) return;
        await addComment(space, postId, topComment.trim(), user?.username ?? 'anon');
        setTopComment('');
        await load();
    };

    if (!post) return <div>Loading...</div>;

    return (
        <div>
            <a href={`/${encodeURIComponent(space)}`} style={{color: '#555'}}>← Back to /s/{space}</a>
            <h2 style={{fontSize: 22, fontWeight: 600, margin: '8px 0'}}>{post.title ?? `Post ${post.id}`}</h2>
            <p style={{whiteSpace: 'pre-wrap'}}>{post.content}</p>

            <form onSubmit={submitTopComment} style={{display: 'grid', gap: 8, marginTop: 16}}>
        <textarea
            value={topComment}
            onChange={(e) => setTopComment(e.target.value)}
            placeholder="Add a comment"
            rows={3}
            style={{border: '1px solid #ddd', padding: 8}}
        />
                <button type="submit" className={"hover:cursor-pointer border-1 p-2 mb-16"}>Comment</button>
            </form>

            <h3 style={{marginTop: 24}}>Comments</h3>
            <div style={{display: 'grid', gap: 8, marginTop: 8}}>
                {(post.comments ?? []).map((c) => (
                    <CommentThread
                        key={String(c.id)}
                        space={space}
                        postId={postId}
                        comment={c}
                    />
                ))}
            </div>
        </div>
    );
}

function CommentThread({
                           space,
                           postId,
                           comment,
                           depth = 0,
                       }: {
    space: string;
    postId: string | number;
    comment: Comment;
    depth?: number;
}) {
    const {user} = useUser();
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [children, setChildren] = useState<Comment[] | null>(comment.replies ?? null);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const loadReplies = async () => {
        if (children !== null) return; // already loaded or empty
        setLoadingReplies(true);
        try {
            const data = await getReplies(space, postId, comment.id);
            setChildren(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load replies');
        } finally {
            setLoadingReplies(false);
        }
    };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        await addReply(space, postId, comment.id, replyText.trim(), user?.username ?? 'anon');
        setReplyText('');
        setReplyOpen(false);
        // refresh child list
        setChildren(null);
        await loadReplies();
    };

    return (
        <div style={{marginLeft: depth * 16, borderLeft: '2px solid #f2f2f2', paddingLeft: 8}}>
            <div style={{fontSize: 14}}>
                <strong>{comment.author ?? 'anon'}</strong>: {comment.comment}
            </div>
            <div style={{display: 'flex', gap: 8, marginTop: 4}}>
                <button onClick={() => setReplyOpen((v) => !v)} style={{padding: '2px 6px'}}>
                    {replyOpen ? 'Cancel' : 'Reply'}
                </button>
                <button onClick={loadReplies} style={{padding: '2px 6px'}} disabled={loadingReplies}>
                    {loadingReplies ? 'Loading…' : 'Load replies'}
                </button>
            </div>

            {replyOpen && (
                <form onSubmit={submitReply} style={{display: 'grid', gap: 6, marginTop: 6}}>
          <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply"
              style={{border: '1px solid #ddd', padding: 6}}
          />
                    <button type="submit" style={{width: 'fit-content', padding: '4px 8px'}}>Post reply</button>
                </form>
            )}

            {children && children.length > 0 && (
                <div style={{display: 'grid', gap: 8, marginTop: 8}}>
                    {children.map((child) => (
                        <CommentThread
                            key={String(child.id)}
                            space={space}
                            postId={postId}
                            comment={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
