// app/page.tsx - Quick fix to stop build errors
import { Suspense } from 'react';
import { LandingPage } from "@/components/home/landingPage";

// ❌ Remove these lines that cause static generation during build
// export const revalidate = 300;
// export const dynamic = 'force-static';

// ✅ Add this to make it dynamic (no build-time generation)
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'NoNRML - Premium Indian Streetwear | Expressive Unisex Fashion',
  description: 'NoNRML (pronounced "No Normal") is India\'s leading premium streetwear brand. Shop the latest unisex expressive styles including oversized tees, premium shirts, and denim for a bold, raw, meaningful and trend-setting look. New drops weekly.',
  keywords: ['streetwear India', 'premium streetwear', 'unisex fashion', 'oversized tees', 'NoNRML', 'limited edition drops', 'Indian streetwear brand', 'expressive clothing', 'homegrown fashion', 'streetwear online India', 'bold fashion', 'trendsetting apparel'],
  openGraph: {
    title: 'NoNRML - Premium Indian Streetwear | Expressive Unisex Fashion',
    description: 'Shop the latest unisex expressive styles from India\'s premium homegrown streetwear brand. Bold, raw, meaningful fashion with weekly drops.',
    url: 'https://www.nonrml.co.in',
    siteName: 'NoNRML',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'NoNRML Premium Streetwear Collection',
    }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoNRML - Premium Indian Streetwear',
    description: 'Shop limited-edition streetwear drops. Bold, expressive unisex fashion from India\'s homegrown premium brand.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.nonrml.co.in',
  },
};


// Loading skeleton for the entire page
const PageSkeleton = () => (
  <main className="flex min-h-screen pt-14 flex-col items-center overflow-y-scroll">
    <div className="w-screen h-screen bg-gray-200 animate-pulse" />
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  </main>
);

export default async function Home() {
  return (
    <main className="flex min-h-screen pt-14 flex-col items-center overflow-y-scroll">
      <Suspense fallback={<PageSkeleton />}>
        <LandingPage />
      </Suspense>
    </main>
  );
}