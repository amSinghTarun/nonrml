import type { Metadata } from "next";
import { Inter, Yeseva_One, Vidaloka, Ubuntu, Ultra, Kenia } from "next/font/google";
import "./globals.css";
import { Appbar } from "@/components/appbar";
import { Providers } from "./provider";
import { Sidebar } from "@/components/sidebar";

const appFont = Ubuntu({subsets: ["latin"], weight:"400"})
 
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${appFont.className} relative min-h-screen `}>
        <Providers>
          < Appbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
