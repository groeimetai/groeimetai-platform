/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow ngrok and other development origins
  async headers() {
    return process.env.NODE_ENV === 'development' ? [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ] : []
  },
  // Experimental features for better Docker performance
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Tijdelijk build errors negeren voor deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Webpack configuration for Docker
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        events: false,
        child_process: false,
        net: false,
        tls: false,
        stream: false,
        crypto: false,
      };
    }
    
    // Ignore problematic modules
    config.externals = [...(config.externals || [])];
    
    // Ignore binary node modules by treating them as external
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        ({ request }, callback) => {
          if (/\.node$/.test(request)) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        }
      ];
    }
    
    return config;
  },
}

module.exports = nextConfig