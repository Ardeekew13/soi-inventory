import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					// HTTPS enforcement
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains; preload'
					},
					// Prevent clickjacking
					{
						key: 'X-Frame-Options',
						value: 'DENY'
					},
					// Prevent MIME type sniffing
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					},
					// XSS Protection
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block'
					},
					// Referrer Policy
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin'
					},
					// Permissions Policy
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
					},
					// Content Security Policy
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: https: blob:",
							"font-src 'self' data:",
							"connect-src 'self' https://res.cloudinary.com",
							"frame-ancestors 'none'",
							"base-uri 'self'",
							"form-action 'self'"
						].join('; ')
					}
				]
			}
		];
	}
};

export default nextConfig;
