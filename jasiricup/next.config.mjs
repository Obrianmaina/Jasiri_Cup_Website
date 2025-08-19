/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add this images configuration to allow loading from Cloudinary
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/dsvexizbx/**', // This allows all paths under your Cloudinary cloud name
            },
        ],
    },
    // This console.log will help us debug environment variables.
    // It prints in your terminal when you run npm run dev.
    webpack: (config, { isServer }) => {
        if (isServer) {
            console.log('\n--- next.config.mjs Environment Debug ---');
            console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING ? 'Loaded' : 'NOT LOADED');
            console.log('TEST_VAR:', process.env.TEST_VAR ? 'Loaded' : 'NOT LOADED'); // Log the new test variable
            console.log('-------------------------------------------\n');
        }
        return config;
    },
};

export default nextConfig;
