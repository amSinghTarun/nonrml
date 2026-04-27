import { session } from "@nonrml/configs";
import { prisma, prismaTypes } from "@nonrml/prisma";

type Context = {
  prisma: typeof prisma,
  session: session | null,
  req?: Request,
  res?: Response
};

export const createContext = ({session, req, res}: {session: session | null, req?: Request, res?: Response}): Context => {
  return {
    prisma,
    session,
    req,
    res
  }
};

export type TRPCContext = ReturnType<typeof createContext>;