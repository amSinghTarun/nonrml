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
  title: "NoNRML",
  description: "NoNRML(pronounced as no normal) Streetwear Clothing Brand",
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