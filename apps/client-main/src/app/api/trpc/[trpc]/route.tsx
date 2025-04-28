import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@nonrml/trpc";
import { getSession } from "@nonrml/configs";

const handler = async (req: Request) => { 
  // console.log("\n\REQUEST "," ----------------- \n", req);
  return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => createContext({req:req, session: await getSession()}),
      responseMeta() {
        return {
          headers: {
            'Access-Control-Allow-Origin': '*', // Or specify your frontend domain
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
          },
        };
      },
  })
}
  
export { handler as GET, handler as POST }
