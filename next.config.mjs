/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 图像优化 | Image Optimization
  images: {
    domains: [
      'localhost',
      'cdn.example.com',
      's3.amazonaws.com',
      'oss-cn-hangzhou.aliyuncs.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // 实验性特性 | Experimental Features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // 排除不相关的目录 | Exclude Irrelevant Directories
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Webpack 配置 | Webpack Configuration
  webpack: (config, { isServer }) => {
    // 排除不相关的子项目
    config.module.rules.push({
      test: /\.(tsx|ts|jsx|js)$/,
      exclude: [
        /node_modules/,
        /liuliangchuhai/,
        /liuliangchuhaillch/,
      ],
    });
    // 3D模型加载器
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });

    // SVG 作为 React 组件
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // 音频文件
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
    });

    // Three.js 优化
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': 'three/build/three.module.js',
      };
    }

    return config;
  },

  // 环境变量 | Environment Variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_ENABLE_3D: process.env.NEXT_PUBLIC_ENABLE_3D,
    NEXT_PUBLIC_ENABLE_AR: process.env.NEXT_PUBLIC_ENABLE_AR,
  },

  // Headers 配置 | Headers Configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
