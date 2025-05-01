"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "./client";
import SuperJSON from "superjson";
import { createTRPCProxyClient } from '@trpc/client';
import { createServerSideHelpers } from '@trpc/react-query/server';

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: SuperJSON,
      links: [
        httpLink({
          url: "/api/trpc",
          fetch(url, options){
            return fetch(url, {
              ...options,
              credentials: "include"
            })
          }
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}