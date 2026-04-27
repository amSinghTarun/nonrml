import { session } from "@nonrml/configs";
import { t } from "./trpc";
import { appRouter } from "./routers";
import { createContext } from "./contexts/context";

export const createServerCaller = (session: session | null) =>
    t.createCallerFactory(appRouter)(createContext({ session }));
