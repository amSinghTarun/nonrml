'use client';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from 'recoil';
import TRPCProvider from '@/app/_trpc/provider';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TRPCProvider>
      <SessionProvider>
          <RecoilRoot>
            {children}
          </RecoilRoot>
      </SessionProvider>
    </TRPCProvider>
  )
}