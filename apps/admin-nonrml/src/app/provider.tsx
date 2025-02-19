'use client'

import { ReactNode } from 'react';
import SessionProvider from '@/providers/SessionProvider';
import TRPCProvider from '@/app/_trpc/provider';
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import { session } from '@nonrml/configs';

export const Providers = ({ session, children }: { session: session|null, children: ReactNode }) => {
    return (
        <TRPCProvider>
            <NextAuthProvider session={session}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </NextAuthProvider>
        </TRPCProvider>
    )
}