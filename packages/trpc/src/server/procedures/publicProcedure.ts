import { rateLimitLoginMiddleware } from "../middlewares/rateLimitMiddleware";
import { procedure } from "../trpc";

export { procedure as publicProcedure} from "../trpc";
export const loginRestrictedProcedure = procedure.use(rateLimitLoginMiddleware);