import { getSession } from "@nonrml/configs";
import { createServerCaller } from "@nonrml/trpc";

export const serverClient = async () => createServerCaller(await getSession())
