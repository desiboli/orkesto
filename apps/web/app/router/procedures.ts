import "server-only"

import { ORPCError, os } from "@orpc/server"
import { auth } from "@/lib/auth"

export type AuthedContext = {
  user: { id: string; name: string; email: string; image: string | null }
  session: { id: string; userId: string }
}

const baseWithHeaders = os.$context<{ headers: Headers }>()

const authMiddleware = baseWithHeaders.middleware(async ({ context, next }) => {
  const session = await auth.api.getSession({
    headers: context.headers,
  })

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      user: session.user,
      session: session.session,
    } as AuthedContext,
  })
})

export const publicProcedure = baseWithHeaders

export const authedProcedure = baseWithHeaders.use(authMiddleware)
