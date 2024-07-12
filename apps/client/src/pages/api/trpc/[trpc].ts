import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from "@nonorml/trpc"
import { createContext } from '@nonorml/trpc';

export default createNextApiHandler({
  router: appRouter,
  createContext
});