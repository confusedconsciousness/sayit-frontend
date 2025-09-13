export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${msg}`);
    }
    return await res.json() as Promise<T>;
}

// Spaces
export const getSpaces = () => http<any[]>('/v1/spaces');

export const createSpace = (name: string, author: string, description: string) =>
    http<any>('/v1/spaces', {method: 'POST', body: JSON.stringify({name, author, description})});

// Posts
export const getPosts = (space: string) =>
    http<any[]>(`/v1/spaces/${encodeURIComponent(space)}/posts`);

export const createPost = (
    space: string,
    title: string,
    content: string,
    author: string, // add author
) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts`, {
        method: 'POST',
        body: JSON.stringify({title, content, author}),
    });
export const getPost = (space: string, postId: string | number) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}`);

export const upvotePost = (space: string, postId: string | number) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/upvote`, {
        method: 'PUT',
    });

export const downvotePost = (space: string, postId: string | number) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/downvote`, {
        method: 'PUT',
    });


// Comments
export const addComment = (
    space: string,
    postId: string | number,
    comment: string,
    author: string,
) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({comment, author}),
    });

// lib/api.ts (additions)
export const upvoteComment = (
    space: string,
    postId: string | number,
    commentId: string | number,
) =>
    http<any>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${commentId}/upvote`,
        {method: 'PUT'},
    );

export const downvoteComment = (
    space: string,
    postId: string | number,
    commentId: string | number,
) =>
    http<any>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${commentId}/downvote`,
        {method: 'PUT'},
    );


export const addReply = (
    space: string,
    postId: string | number,
    parentId: string | number,
    comment: string,
    author: string, // add author
) =>
    http<any>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
        {method: 'POST', body: JSON.stringify({comment, author})},
    );

export const getReplies = (
    space: string,
    postId: string | number,
    parentId: string | number,
) => http<any[]>(
    `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
);

