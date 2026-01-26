import type { Metadata } from "next";
import Script from "next/script"; // Import Next.js Script
import "./globals.css";
import { Appbar } from "@/components/Appbar";
import { Providers } from "./provider";
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/Footer";
import { NavbarStateControlProvider } from "@/providers/navbarStateControlProvider";
import { MetaPixelProvider } from "@/providers/metaPixelProvider";
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
      <head>
        {/* Google Tag Manager */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="clarity-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className={`${appFont.className} min-h-screen `}>
        {/* Meta (Facebook) Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID ? (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  fbq('track', 'PageView');
                  if (typeof console !== 'undefined') {
                    console.log('✅ Meta Pixel initialized. Pixel ID: ${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  }
                `,
              }}
            />
            <noscript>
              <img 
                height="1" 
                width="1" 
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : (
          process.env.NODE_ENV === "development" && (
            <script
              dangerouslySetInnerHTML={{
                __html: `console.warn("⚠️ NEXT_PUBLIC_META_PIXEL_ID is not set. Meta Pixel events will not be tracked.");`,
              }}
            />
          )
        )}
        <Providers>
          <MetaPixelProvider />
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
}