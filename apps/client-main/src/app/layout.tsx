import type { Metadata } from "next";
import "./globals.css";
import { Appbar } from "@/components/Appbar";
import { Providers } from "./provider";
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/Footer";
import { NavbarStateControlProvider } from "@/providers/navbarStateControlProvider";
import { Ubuntu,  Albert_Sans } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const appFont = Albert_Sans({subsets: ["latin"], weight:["200", "300", "400", "500", "600", "700", "800", "900"]});
 
export const metadata: Metadata = {
  metadataBase: new URL('https://www.nonrml.co.in'),
  title: {
    default: 'NoNRML - Premium Streetwear Brand in India | Unisex Fashion',
    template: '%s | NoNRML'
  },
  description: 'NoNRML (pronounced "No Normal") is India\'s premium streetwear brand offering bold, expressive unisex clothing. Shop limited edition drops, oversized tees, shirts, and premium denim for a raw, meaningful, trend-setting style.',
  keywords: ['streetwear India', 'premium streetwear', 'unisex clothing', 'oversized tees', 'streetwear brand', 'NoNRML', 'limited edition drops', 'Indian fashion brand', 'expressive fashion', 'homegrown streetwear'],
  authors: [{ name: 'NoNRML' }],
  creator: 'NoNRML',
  publisher: 'NoNRML',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.nonrml.co.in',
    siteName: 'NoNRML',
    title: 'NoNRML - Premium Streetwear Brand in India',
    description: 'Shop bold, expressive unisex streetwear from India\'s premium homegrown brand NoNRML. Limited edition drops and trend-setting styles.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NoNRML Streetwear Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoNRML - Premium Streetwear Brand in India',
    description: 'Shop bold, expressive unisex streetwear. Limited edition drops from India\'s homegrown premium brand.',
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
  verification: {
    google: 'IZcaLT3GH5Y3VhtIu_Y-ipJEbm7bhUSMBCQmh3odmE0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${appFont.className} min-h-screen `}>
        <Providers>
          <Appbar/>
              <NavbarStateControlProvider />
                {children}
                <Analytics />
                <SpeedInsights />
              <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
};