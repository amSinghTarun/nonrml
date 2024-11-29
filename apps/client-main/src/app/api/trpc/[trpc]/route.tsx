import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@nonrml/trpc";
import { getSession } from "@nonrml/configs";

const handler = async (req: Request, res: Response) => { 
  // console.log("\n\nRESPONSE ::","\n:::::", res);
  return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => createContext({req:req, session: await getSession()}),
  })
}
  
export { handler as GET, handler as POST }
