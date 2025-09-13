const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.API_BASE || 'http://localhost:8080/:path*',
            },
        ];
    },
};
module.exports = nextConfig;