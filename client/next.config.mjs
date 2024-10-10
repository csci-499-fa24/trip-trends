/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/homepage',
                permanent: true,
            },
        ];
    },
};
export default nextConfig;
