// app/page.tsx - Quick fix to stop build errors
import { Suspense } from 'react';
import { LandingPage } from "@/components/home/landingPage";

// ❌ Remove these lines that cause static generation during build
// export const revalidate = 300;
// export const dynamic = 'force-static';

// ✅ Add this to make it dynamic (no build-time generation)
export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL('https://www.nonrml.co.in'), // Add your actual domain
  title: 'NoNRML ( pronounced "No Normal")',
  description: 'NoNRML is a premium streetwear brancd in India. Shop the latest unisex expressive styles from this premium Homegrown streetwear brand for a bold, raw, meaningful and trend-setting look',
  keywords: ['streetwear', 'fashion', 'clothing', 'NoNRML', 'drops', 'limited edition'],
  openGraph: {
    title: 'NoNRML ( pronounced "No Normal")',
    description: 'NoNRML is a premium streetwear brancd in India. Shop the latest unisex expressive styles from this premium Homegrown streetwear brand for a bold, raw, meaningful and trend-setting look',
    url: 'https://www.nonrml.co.in',
    siteName: 'NoNRML',
    images: [{
      url: '/og-image.jpg', // Create this
      width: 1200,
      height: 630,
      alt: 'NoNRML Streetwear',
    }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoNRML - Expressive Streetwear',
    description: 'Shop limited-edition streetwear drops.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
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