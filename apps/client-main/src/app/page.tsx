// app/page.tsx - Quick fix to stop build errors
import { Suspense } from 'react';
import { LandingPage } from "@/components/home/landingPage";

// ❌ Remove these lines that cause static generation during build
// export const revalidate = 300;
// export const dynamic = 'force-static';

// ✅ Add this to make it dynamic (no build-time generation)
export const dynamic = 'force-dynamic';

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