import NextAuth from "next-auth" 
import { NEXT_AUTH_CONFIG as authOptions } from "@nonrml/configs";

export const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}