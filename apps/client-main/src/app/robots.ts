// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
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
      ],
    },
    sitemap: 'https://www.nonrml.co.in/sitemap.xml',
  };
}
