export interface AppComment {
    id: string | number;
    comment?: string;
    author?: string;
    comments?: AppComment[];
    upvotes?: number;
    createdAt?: string; // ISO date string
    downvotes?: number;
}

export interface Post {
    id: string | number;
    title?: string;
    content?: string;
    comments?: AppComment[]; // assuming backend may return top-level comments with the post
    upvotes?: number;
    downvotes?: number;
    createdAt?: string; // ISO date string
    author?: string;
    commentCount?: number;
}

export interface Space {
    id?: string | number;
    name?: string;
    author?: string;
    description?: string;
    createdAt?: string; // ISO date string
}

export interface VoteCount {
    upvotes?: number;
    downvotes?: number;
}