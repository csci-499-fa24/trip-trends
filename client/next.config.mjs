/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com'], // Allow images from this domain
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/signup',
                permanent: true,
            },
        ];
    },
};
export default nextConfig;
