'use client';

import React, {useEffect, useState} from 'react';
import {
    addComment,
    addReply,
    downvoteComment,
    downvotePost,
    getPost,
    getReplies,
    upvoteComment,
    upvotePost,
} from '@/lib/api';
import {RedirectToSignIn, useAuth} from '@clerk/nextjs';
import {AppComment, Post} from '@/app/lib/types';
import {getCachedData, invalidateCache} from '@/lib/cacheutils';
import Link from "next/link";
import {formatTimeAgo} from "@/lib/timeutils";


function getCachedPost(space: string, postId: string): Promise<Post> {
    return getCachedData<Post>((`post_${space}_${postId}`), () => getPost(space, postId));
}

function getCachedReplies(space: string, postId: string, commentId: number | string): Promise<AppComment[]> {
    return getCachedData<AppComment[]>(`replies_${space}_${postId}_${commentId}`, () =>
        getReplies(space, postId, commentId)
    );
}

export default function PostPage({params}: { params: Promise<{ space: string; postId: string }> }) {
    const {isSignedIn, getToken} = useAuth();
    const {space, postId} = React.use(params);

    const [redirectToSignIn, setRedirectToSignIn] = React.useState(false);

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [topComment, setTopComment] = useState('');
    const [submittingTop, setSubmittingTop] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getCachedPost(space, postId);
            setPost(data);
        } catch (e) {
            console.error(e);
            alert('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load().then(r => console.log(r));
    }, [space, postId]);

    const doVote = async (dir: 'up' | 'down') => {
        if (!post) return;

        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }

        const originalPost = {...post};
        const newPost = {...post};
        if (dir === 'up') newPost.upvotes = (newPost.upvotes ?? 0) + 1;
        else newPost.downvotes = (newPost.downvotes ?? 0) + 1;
        setPost(newPost);

        try {
            const token = (await getToken({template: 'with-username'})) as string;
            const updatedCounts =
                dir === 'up'
                    ? await upvotePost(space, post.id, token)
                    : await downvotePost(space, post.id, token);
            setPost((prev) => ({
                ...prev!,
                upvotes: updatedCounts.upvotes,
                downvotes: updatedCounts.downvotes,
            }));
            invalidateCache(`post_${space}_${postId}`);
        } catch (error) {
            console.error('Failed to vote:', error);
            setPost(originalPost);
            alert('Your vote could not be saved. Please try again.');
        }
    };

    const submitTopComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topComment.trim() || submittingTop) return;

        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }

        setSubmittingTop(true);
        try {
            const token = (await getToken({template: 'with-username'})) as string;
            await addComment(space, postId, topComment.trim(), token);
            invalidateCache(`post_${space}_${postId}`);
            setTopComment('');
            await load();
        } catch (err) {
            console.error(err);
            alert('Failed to add comment');
        } finally {
            setSubmittingTop(false);
        }
    };

    if (loading || !post) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-600">
                <span
                    className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                    aria-hidden="true"
                />
                Loading post…
            </div>
        );
    }

    if (redirectToSignIn) {
        return <RedirectToSignIn redirectUrl={window.location.href}/>;
    }

    return (
        <div>
            <Link href={`/${encodeURIComponent(space)}`} style={{color: '#555'}}>
                ← Back to /s/{space}
            </Link>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                    margin: '8px 0',
                }}
            >
                <h2 style={{fontSize: 22, fontWeight: 700, margin: 0}}>
                    {post.title ?? `Post ${post.id}`}
                </h2>
                <div style={{fontSize: 15, color: '#6b7280', flexShrink: 0}}>
                    by {post.author ?? 'anon'} • {formatTimeAgo(post.createdAt)}
                </div>
            </div>

            <p style={{whiteSpace: 'pre-wrap', marginTop: 6}}>{post.content}</p>

            <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0'}}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #e5e7eb',
                        borderRadius: 9999,
                        padding: '2px 8px',
                    }}
                >
                    <button onClick={() => doVote('up')} className="voteButton">
                        ▲
                    </button>
                    <span className="vote">{post.upvotes ?? 0}</span>
                    <button onClick={() => doVote('down')} className="voteButton">
                        ▼
                    </button>
                    <span className="vote">{post.downvotes ?? 0}</span>
                </div>
            </div>

            <form onSubmit={submitTopComment} style={{display: 'grid', gap: 8, marginTop: 16}}
                  aria-busy={submittingTop}>
                <textarea
                    value={topComment}
                    onChange={(e) => setTopComment(e.target.value)}
                    placeholder="Add a comment"
                    rows={3}
                    style={{border: '1px solid #ddd', padding: 8}}
                />
                <button
                    type="submit"
                    disabled={submittingTop || !topComment.trim()}
                    aria-busy={submittingTop}
                    className="hover:cursor-pointer border-1 p-2 mb-16 dark:hover:bg-white dark:hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submittingTop ? (
                        <span className="inline-flex items-center">
                            <span
                                className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                                aria-hidden="true"
                            />
                            Commenting…
                        </span>
                    ) : (
                        'Comment'
                    )}
                </button>
            </form>

            <h3 style={{marginTop: 24}}>Comments</h3>
            <div style={{display: 'grid', gap: 8, marginTop: 8}}>
                {(post.comments ?? []).map((c) => (
                    <CommentThread key={String(c.id)} space={space} postId={postId} comment={c} onActionSuccess={load}/>
                ))}
            </div>
        </div>
    );
}

function CommentThread({
                           space,
                           postId,
                           comment,
                           onActionSuccess,
                           depth = 0,
                       }: {
    space: string;
    postId: string;
    comment: AppComment;
    onActionSuccess: () => Promise<void>;
    depth?: number;
}) {
    const {isSignedIn, getToken} = useAuth();

    const [redirectToSignIn, setRedirectToSignIn] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [children, setChildren] = useState<AppComment[] | null>(comment.comments ?? null);
    const [areRepliesVisible, setAreRepliesVisible] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replySubmitting, setReplySubmitting] = useState(false);
    const [ups, setUps] = useState<number>(comment.upvotes ?? 0);
    const [downs, setDowns] = useState<number>(comment.downvotes ?? 0);

    const toggleRepliesVisibility = async () => {
        const becomingVisible = !areRepliesVisible;
        setAreRepliesVisible(becomingVisible);

        if (becomingVisible && !children) {
            setLoadingReplies(true);
            try {
                const data = await getCachedReplies(space, postId, comment.id);
                setChildren(data);
            } catch (e) {
                console.error(e);
                alert('Failed to load replies');
                setAreRepliesVisible(false);
            } finally {
                setLoadingReplies(false);
            }
        }
    };

    const vote = async (dir: 'up' | 'down') => {
        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }
        const originalState = {ups, downs};
        const upDelta = dir === 'up' ? 1 : 0;
        const downDelta = dir === 'down' ? 1 : 0;
        setUps((v) => v + upDelta);
        setDowns((v) => v + downDelta);
        try {
            const token = (await getToken({template: 'with-username'})) as string;
            const newCounts =
                dir === 'up'
                    ? await upvoteComment(space, postId, comment.id, token)
                    : await downvoteComment(space, postId, comment.id, token);
            setUps(newCounts.upvotes ?? originalState.ups);
            setDowns(newCounts.downvotes ?? originalState.downs);
        } catch (e) {
            setUps(originalState.ups);
            setDowns(originalState.downs);
            console.error(e);
            alert('Your vote could not be saved.');
        }
    };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || replySubmitting) return;

        if (!isSignedIn) {
            setRedirectToSignIn(true);
            return;
        }
        setReplySubmitting(true);
        try {
            const token = (await getToken({template: 'with-username'})) as string;
            await addReply(space, postId, comment.id, replyText.trim(), token);

            setReplyText('');
            setReplyOpen(false);

            invalidateCache(`post_${space}_${postId}`);

            await onActionSuccess();
        } catch (e) {
            console.error(e);
            alert('Failed to post reply');
        } finally {
            setReplySubmitting(false);
        }
    };

    if (redirectToSignIn) {
        return <RedirectToSignIn redirectUrl={window.location.href}/>;
    }

    const hasReplies = !comment.comments || comment.comments.length > 0;

    return (
        <div style={{marginLeft: depth * 16, borderLeft: '2px solid #f2f2f2', paddingLeft: 8}}>
            {/* MODIFIED: Restructured the comment header to include the timestamp */}
            <div className="text-sm">
                <span className="font-bold mr-2">{comment.author ?? 'anon'}</span>
                <span className="text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            <p className="mt-1">{comment.comment}</p>


            <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 0', flexShrink: 0}}>
                <button onClick={() => vote('up')} className="voteButton" aria-label="Upvote" title="Upvote">
                    ▲
                </button>
                <span className="vote">{ups}</span>
                <button onClick={() => vote('down')} className="voteButton" aria-label="Downvote" title="Downvote">
                    ▼
                </button>
                <span className="vote">{downs}</span>
            </div>

            <div style={{display: 'flex', gap: 8, marginTop: 4}}>
                <button onClick={() => setReplyOpen((v) => !v)} style={{padding: '2px 6px', cursor: 'pointer'}}>
                    {replyOpen ? 'Cancel' : 'Reply'}
                </button>

                {hasReplies && (
                    <button onClick={toggleRepliesVisibility} style={{padding: '2px 6px', cursor: 'pointer'}}
                            disabled={loadingReplies}>
                        {loadingReplies
                            ? 'Loading…'
                            : areRepliesVisible
                                ? 'Hide replies'
                                : 'View replies'
                        }
                    </button>
                )}
            </div>

            {replyOpen && (
                <form onSubmit={submitReply} style={{display: 'grid', gap: 6, marginTop: 6}}
                      aria-busy={replySubmitting}>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        placeholder="Write a reply"
                        style={{border: '1px solid #ddd', padding: 6}}
                    />
                    <button
                        type="submit"
                        style={{width: 'fit-content', padding: '4px 8px', cursor: 'pointer'}}
                        disabled={replySubmitting || !replyText.trim()}
                        aria-busy={replySubmitting}
                    >
                        {replySubmitting ? (
                            <span className="inline-flex items-center">
                                <span
                                    className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                                    aria-hidden="true"
                                />
                                Posting…
                            </span>
                        ) : (
                            'Post reply'
                        )}
                    </button>
                </form>
            )}

            {areRepliesVisible && children && children.length > 0 && (
                <div style={{display: 'grid', gap: 8, marginTop: 8}}>
                    {children.map((child) => (
                        <CommentThread key={String(child.id)} space={space} postId={postId} comment={child}
                                       onActionSuccess={onActionSuccess} depth={depth + 1}/>
                    ))}
                </div>
            )}
        </div>
    );
}