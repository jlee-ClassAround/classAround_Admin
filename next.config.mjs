/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'utfs.io',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    experimental: {
        serverComponentsExternalPackages: ['@prisma/client'],
        outputFileTracingIncludes: {
            '/**': ['./src/generated/**'],
        },
    },
};

export default nextConfig;
