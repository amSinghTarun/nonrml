// app/page.tsx
import { Suspense } from 'react';
import { LandingPage } from "@/components/home/landingPage";
import { preloadHomepageData } from "@/app/actions/product.action";

// Enable Incremental Static Regeneration
export const revalidate = 300; // Revalidate every 5 minutes

// Enable static generation
export const dynamic = 'force-static';

// Preconnect to external domains for faster resource loading
const PreconnectLinks = () => (
  <>
    <link rel="preconnect" href="https://images.your-cdn.com" />
    <link rel="dns-prefetch" href="https://api.your-domain.com" />
    <link rel="preload" as="image" href="/images/logo.png" />
  </>
);

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
  // Preload data during build time / ISR
  try {
    await preloadHomepageData();
  } catch (error) {
    console.error('Error preloading homepage data:', error);
  }

  return (
    <>
      <PreconnectLinks />
      <main className="flex min-h-screen pt-14 flex-col items-center overflow-y-scroll">
        <Suspense fallback={<PageSkeleton />}>
          <LandingPage />
        </Suspense>
      </main>
    </>
  );
}

// Metadata for SEO and performance
export const metadata = {
  title: 'NoNRML - Expressive Streetwear',
  description: 'Discover the latest in expressive streetwear fashion. Shop our latest drops and exclusive collections.',
  keywords: 'streetwear, fashion, clothing, NoNRML, latest drops',
  openGraph: {
    title: 'NoNRML - Expressive Streetwear',
    description: 'Discover the latest in expressive streetwear fashion.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoNRML - Expressive Streetwear',
    description: 'Discover the latest in expressive streetwear fashion.',
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
};