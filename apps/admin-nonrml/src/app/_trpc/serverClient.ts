import { getSession } from "@nonrml/configs";
import { createServerCaller } from "@nonrml/trpc";

export const serverClient = async () => {
    const session = await getSession();
    createServerCaller(session)
}
