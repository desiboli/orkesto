import "server-only"

import * as z from "zod"
import { authedProcedure } from "@/app/router/procedures"

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.string().nullable(),
})

export const me = authedProcedure
  .route({ method: "GET", path: "/users/me" })
  .output(UserSchema)
  .handler(async ({ context }) => {
    return {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
      image: context.user.image ?? null,
    }
  })

export const userRouter = {
  me,
}
