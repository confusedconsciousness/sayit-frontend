export interface AppComment {
    id: string | number;
    comment?: string;
    author?: string;
    comments?: AppComment[];
    upvotes?: number;
    downvotes?: number;
}

export interface Post {
    id: string | number;
    title?: string;
    content?: string;
    comments?: AppComment[]; // assuming backend may return top-level comments with the post
    upvotes?: number;
    downvotes?: number;
    author?: string;
}

export interface Space {
    id?: string | number;
    name?: string;
    description?: string
}

export interface VoteCount {
    upvotes?: number;
    downvotes?: number;
}