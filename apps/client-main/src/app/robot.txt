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
          '/policies/*',
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
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/contact-us',
          '/collections',
          '/collections/*',
          '/products/*',
          '/policies/*',
          '/track-order',
        ],
        disallow: [
          '/api/',
          '/checkout/',
          '/orders/',
          '/creditNote/',
          '/exchanges/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: ['Applebot', 'Bingbot'],
        allow: [
          '/',
          '/about',
          '/contact-us',
          '/collections',
          '/collections/*',
          '/products/*',
          '/policies/*',
          '/track-order',
        ],
        disallow: [
          '/api/',
          '/checkout/',
          '/orders/',
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}