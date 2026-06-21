import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/portal/Doctor',
        destination: '/portal/doctor',
        permanent: true,
      },
      {
        source: '/portal/Hospital',
        destination: '/portal/hospital',
        permanent: true,
      },
      {
        source: '/portal/Pharmacy',
        destination: '/portal/pharmacy',
        permanent: true,
      },
      {
        source: '/portal/Lab',
        destination: '/portal/lab',
        permanent: true,
      },
      {
        source: '/portal/Ambulance',
        destination: '/portal/ambulance',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
