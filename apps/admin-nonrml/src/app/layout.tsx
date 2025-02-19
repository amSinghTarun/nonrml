import "./globals.css";
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Providers } from "./provider";
import { getSession } from "@nonrml/configs";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession()
  return (
    <html lang="en">
      <body >
        <Providers session={session}>
          <SidebarProvider className="relative">
            <SidebarTrigger className="fixed inset-y-0 right-0 rounded-r-none rounded-t-none bg-orange-500 text-white" size="lg"/>
            <AppSidebar />
            <main>
              {children}
            </main>
          </SidebarProvider>
          </Providers>
      </body>
    </html>
  );
}
