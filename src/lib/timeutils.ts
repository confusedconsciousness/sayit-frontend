export function formatTimeAgo(dateString?: string): string {
    if (!dateString) return '';

    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const years = Math.floor(seconds / 31536000);
    if (years > 0) return `${years}yr ago`;

    const months = Math.floor(seconds / 2592000);
    if (months > 0) return `${months}mo ago`;

    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days}d ago`;

    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ago`;

    return `${seconds}s ago`;
}