import {AppComment, Post, Space, VoteCount} from "@/app/lib/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

async function http<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${msg}`);
    }
    // Handle cases where the response body might be empty (e.g., for a 204 No Content)
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
}


// === Spaces ===
export const getSpace = (space: string) => http<Space>(`/v1/spaces/${encodeURIComponent(space)}`);
export const getSpaces = () => http<Space[]>('/v1/spaces');

export const createSpace = (name: string, description: string, token: string) =>
    http<Space>('/v1/spaces', token, {method: 'POST', body: JSON.stringify({name, description})});

// === Posts ===
export const getPosts = (space: string) =>
    http<Post[]>(`/v1/spaces/${encodeURIComponent(space)}/posts`);

export const createPost = (
    space: string,
    title: string,
    content: string,
    token: string,
) =>
    http<Post>(`/v1/spaces/${encodeURIComponent(space)}/posts`, token, {
        method: 'POST',
        body: JSON.stringify({title, content}),
    });

export const getPost = (space: string, postId: string | number) =>
    http<Post>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}`);


export const upvotePost = (space: string, postId: string | number, token: string) =>
    http<VoteCount>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/upvote`, token, {
        method: 'PUT',
    });

export const downvotePost = (space: string, postId: string | number, token: string) =>
    http<VoteCount>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/downvote`, token, {
        method: 'PUT',
    });


// === Comments & Replies ===
export const addComment = (
    space: string,
    postId: string | number,
    comment: string,
    token: string,
) =>
    http<AppComment>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments`, token, {
        method: 'POST',
        body: JSON.stringify({comment}),
    });

export const upvoteComment = (
    space: string,
    postId: string | number,
    commentId: string | number,
    token: string,
) =>
    http<VoteCount>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${commentId}/upvote`,
        token,
        {method: 'PUT'},
    );

export const downvoteComment = (
    space: string,
    postId: string | number,
    commentId: string | number,
    token: string,
) =>
    http<VoteCount>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${commentId}/downvote`,
        token,
        {method: 'PUT'},
    );

export const addReply = (
    space: string,
    postId: string | number,
    parentId: string | number,
    comment: string,
    token: string,
) =>
    http<Comment>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
        token,
        {method: 'POST', body: JSON.stringify({comment})},
    );

export const getReplies = (
    space: string,
    postId: string | number,
    parentId: string | number,
) => http<AppComment[]>(
    `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
);