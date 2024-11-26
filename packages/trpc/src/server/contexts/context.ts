import {  session } from "@nonrml/configs";
import { prisma, prismaTypes } from "@nonrml/prisma";


type Context = {
  prisma: typeof prisma,
  session?: session | null,
  user?: prismaTypes.User
  req?: Request,
  res?:Response
}

export const createContext = ({session, req, res}: {session:session|null, req?: Request, res?:Response}): Context => {
  //console.log("Session ::: \n", session)
  return {
    prisma,
    session: session,
    req: req,
    res: res
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>