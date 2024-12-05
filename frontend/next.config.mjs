/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
				source: "/i",
				destination: "/infinite",
				permanent: true
			},
			{
				source: "/vercel",
				destination: "/infinite",
				permanent: true
			}
		]
	}
};

export default nextConfig;
