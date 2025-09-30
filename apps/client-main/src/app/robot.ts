// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nonrml.co.in';
  
  return {
    rules: [
      {
        userAgent: '*',
        // Allow main content and product pages
        allow: [
          '/',
          '/about',
          '/contact-us',
          '/collections',
          '/collections/*',
          '/products/*',
          '/policies',
          '/returns',
          '/track-order',
        ],
        // Disallow private, admin, and system areas
        disallow: [
          '/api/',
          '/_data/',
          '/_trpc/',
          '/actions/',
          '/checkout/',
          '/orders/',
          '/creditNote/',
          '/exchanges/',
          '/lib/',
          '/admin/',
          '/_next/',
          '/global-error.tsx',
          '/loading.tsx',
          '/not-found.tsx',
          '/provider.tsx'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}