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
    // 限制并行 worker 数量。
    // 本机 16 核、16GB 内存但空闲常不足 5GB，Next 默认按 CPU 核数起 16 个 worker，
    // 实测会因 "Zone Allocation failed - process out of memory" 导致构建崩溃。
    //
    // 注意：这里【不能】设 workerThreads: false。
    // 那会让 Next 改用 fork 子进程（jest-worker + child_process），
    // 而本机环境会拦截子进程创建，dev 下每次 getStaticPaths 都抛
    // "spawn EPERM (errno -4048)"，所有页面 500。
    // 保持默认（worker 线程）即可避开该限制。
    cpus: 4,
  },

  // Webpack 配置 | Webpack Configuration
  webpack: (config, { isServer }) => {
    // 3D模型加载器
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });

    // SVG 作为静态资源（不依赖未安装的 @svgr/webpack）
    config.module.rules.push({
      test: /\.svg$/i,
      type: 'asset/resource',
    });

    // 音频文件
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
    });

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
