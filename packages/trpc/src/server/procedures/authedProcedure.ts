import { isAdmin, isAuthed} from "../middlewares/sessionMiddleware";
import { procedure } from "../trpc";

export const adminProcedure = procedure.use(isAdmin)//.use(checkPermission); //.meta({role: "ADMIN"}) add this after you add meta in init
export const publicProtectedProcedure = procedure.use(isAuthed)

// the orderProcedure check whether the user's account status is ACTIVE or not, as PENDING state means
// the user has changed password/mobile/email all of which are needed to be verified in case of placing order

//export const orderProcedure = procedure.use(isUserAccountActive).use(checkPermission);