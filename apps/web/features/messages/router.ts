import "server-only"

import { authedProcedure } from "@/app/router/procedures"
import { db } from "@/db/drizzle"
import { desc } from "drizzle-orm"
import * as z from "zod"
import { message } from "@/db/schema"
import { inngest } from "@/inngest/client"

const MessagesSchema = z.object({
  value: z.string().min(1, { message: "Message is required" }),
})

const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.enum(["USER", "ASSISTANT"]),
  type: z.enum(["RESULT", "ERROR"]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const getMany = authedProcedure
  .route({ method: "GET", path: "/messages" })
  .output(z.array(MessageSchema))
  .handler(async () => {
    const messages = await db.query.message.findMany({
      orderBy: desc(message.updatedAt),
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
        content: input.value,
        role: "USER",
        type: "RESULT",
      })
      .returning()

    await inngest.send({
      name: "code-agent/run",
      data: {
        value: input.value,
      },
    })

    return createdMessage
  })

export const messagesRouter = {
  getMany,
  create,
}
