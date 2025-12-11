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

    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                '@prisma/classaround-client': 'commonjs @prisma/classaround-client',
                '@prisma/cojooboo-client': 'commonjs @prisma/cojooboo-client',
                '@prisma/ivy-client': 'commonjs @prisma/ivy-client',
            });
        }
        return config;
    },
};

export default nextConfig;
