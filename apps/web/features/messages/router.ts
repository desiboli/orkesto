import "server-only"

import { authedProcedure } from "@/app/router/procedures"
import { db } from "@/db/drizzle"
import { asc, eq } from "drizzle-orm"
import * as z from "zod"
import { message } from "@/db/schema"
import { inngest } from "@/inngest/client"

const MessagesSchema = z.object({
  value: z.string().min(1, "Value is required").max(10000, "Value is too long"),
  projectId: z.string().min(1, "Project ID is required"),
})

export const getMany = authedProcedure
  .route({ method: "GET", path: "/messages" })
  .input(z.object({ projectId: z.string().min(1, "Project ID is required") }))
  .handler(async ({ input }) => {
    const messages = await db.query.message.findMany({
      with: {
        fragment: true,
      },
      where: eq(message.projectId, input.projectId),
      orderBy: asc(message.updatedAt),
    })

    return messages
  })

export const create = authedProcedure
  .route({ method: "POST", path: "/messages" })
  .input(MessagesSchema)
  .handler(async ({ input }) => {
    const [createdMessage] = await db
      .insert(message)
      .values({
        projectId: input.projectId,
        content: input.value,
        role: "USER",
        type: "RESULT",
      })
      .returning()

    await inngest.send({
      name: "code-agent/run",
      data: {
        value: input.value,
        projectId: input.projectId,
      },
    })

    return createdMessage
  })

export const messagesRouter = {
  getMany,
  create,
}
