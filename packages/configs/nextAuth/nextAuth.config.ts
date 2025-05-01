import {Session, getServerSession} from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { JWT } from "next-auth/jwt";
import { prisma } from "@nonrml/prisma";
import type { DefaultSession, NextAuthOptions } from "next-auth"
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/configs/.env.local", "CONFIG ENV LOAD");

//  interface session extends Session {
//     user: {
//       token: string;
//       name: string;
//       id: string,
//       role: string
//     };
//   }
export interface session extends Session {
  user: {
    id: string;
    role: string;
  } & DefaultSession["user"] ;
}
  
interface token extends JWT {
    userId: string;
    role: string;
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
        const user = await prisma.user.findFirstOrThrow({where: { id: Number(credentials?.id)}});
        return {id: `${user?.id}`, role: user?.role}
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }): Promise<JWT> => {
      const newToken: token = token as token;
      if (user && String(trigger) == "signIn") {
        newToken.role = (user as session["user"]).role;
        newToken.userId = (user as session["user"]).id;
      }
      // console.log("jwt callback called", trigger);
      return newToken;
    },
    session: async ({ session, token } ) => {
      // console.log(session, token) 
      const newSession : session = session as session;
      if (newSession.user && token.userId && token.role) {
        newSession.user.id = token.userId as unknown as string;
        newSession.user.role = token.role as string;
      }
      // console.log("session callback called");
      return newSession!;
    },
  },
} satisfies NextAuthOptions 

// need to keep here as calling the getServerSession from app/_trpc/serverClient is throwing some 
// 'headers' error, not sure about the reason and how keeping it here solves the problem, but rule
// of thumb, if it works, it works
// https://next-auth.js.org/configuration/nextjs#in-app-router
export const getSession = async () => {
  const session = await getServerSession(NEXT_AUTH_CONFIG)
  return session as unknown as session
}