import {Session, getServerSession} from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { JWT } from "next-auth/jwt";
import { prisma } from "@nonrml/prisma";
import type { NextAuthOptions } from "next-auth"

export interface session extends Session {
    user: {
      token: string;
      name: string;
      id: string,
      role: string
    };
  }
  
interface token extends JWT {
    userId: string;
    jwtToken: string;
}
  
interface user {
    id: string;
    role: string;
    token: string;
}

const generateJWT = async (payload: JWTPayload) => {
    const secret = process.env.JWT_SECRET || 'secret';
    const jwk = await importJWK({ k: secret, alg: 'HS256', kty: 'oct' });
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('365d')
      .sign(jwk);
    return jwt;
};

export const NEXT_AUTH_CONFIG = {
  secret: process.env.NEXTAUTH_SECRET || 'secr3t',
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        id: {},
      },
      authorize: async (credentials) => {
        // The id should be present and it must be a string object
        // return user object with their profile data
        const user = await prisma.user.findUnique({where: { id: Number(credentials?.id)}});
        const jwt = await generateJWT({
          id: user?.id,
          role: user?.role
        });
        return {id: `${user?.id}`, token: jwt, role: user?.role}
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      const newToken: token = token as token;
      if (user) {
        newToken.userId = user.id;
        newToken.jwtToken = (user as unknown as user).token;
      }
      //console.log("jwt callback called");
      return newToken;
    },
    session: async ({ session, token } ) => {
      const newSession: session = session as unknown as session;
      if (newSession.user && token.userId) {
        newSession.user.id = token.userId as unknown as string;
        newSession.user.token = token.jwtToken as string;
      }
      //console.log("session callback called");
      return newSession!;
    },
  },
} satisfies NextAuthOptions 

// need to keep here as calling the getServerSession from app/_trpc/serverClient is throwing some 
// 'headers' error, not sure about the reason and how keeping it here solves the problem, but rule
// of thumb, if it works, it works
// https://next-auth.js.org/configuration/nextjs#in-app-router
export const getSession = async () => await getServerSession(NEXT_AUTH_CONFIG)