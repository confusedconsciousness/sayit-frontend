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
export const createSpace = (name: string) =>
    http<any>('/v1/spaces', {method: 'POST', body: JSON.stringify({name})});

// Posts
export const getPosts = (space: string) =>
    http<any[]>(`/v1/spaces/${encodeURIComponent(space)}/posts`);
export const createPost = (space: string, title: string, content: string) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts`, {
        method: 'POST',
        body: JSON.stringify({title, content}),
    });
export const getPost = (space: string, postId: string | number) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}`);

// Comments
export const addComment = (space: string, postId: string | number, content: string) =>
    http<any>(`/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({content}),
    });

export const getReplies = (
    space: string,
    postId: string | number,
    parentId: string | number,
) => http<any[]>(
    `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
);

export const addReply = (
    space: string,
    postId: string | number,
    parentId: string | number,
    content: string,
) =>
    http<any>(
        `/v1/spaces/${encodeURIComponent(space)}/posts/${postId}/comments/${parentId}/replies`,
        {method: 'POST', body: JSON.stringify({content})},
    );
