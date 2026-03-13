import "server-only"

import { generateSlug } from "random-word-slugs"
import { desc } from "drizzle-orm"
import * as z from "zod"
import { authedProcedure } from "@/app/router/procedures"
import { db } from "@/db/drizzle"
import { message, project } from "@/db/schema"
import { inngest } from "@/inngest/client"

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const CreateProjectInput = z.object({
  value: z.string().min(1, "Value is required").max(10000, "Value is too long"),
})

export const getMany = authedProcedure
  .route({ method: "GET", path: "/projects" })
  .output(z.array(ProjectSchema))
  .handler(async () => {
    return db.query.project.findMany({
      orderBy: desc(project.updatedAt),
    })
  })

export const create = authedProcedure
  .route({ method: "POST", path: "/projects" })
  .input(CreateProjectInput)
  .handler(async ({ input }) => {
    const { createdProject, createdMessage } = await db.transaction(
      async (tx) => {
        const [createdProject] = await tx
          .insert(project)
          .values({ name: generateSlug(2, { format: "kebab" }) })
          .returning()

        if (!createdProject) {
          throw new Error("Failed to create project")
        }

        const [createdMessage] = await tx
          .insert(message)
          .values({
            projectId: createdProject.id,
            content: input.value,
            role: "USER",
            type: "RESULT",
          })
          .returning()

        if (!createdMessage) {
          throw new Error("Failed to create message")
        }

        return { createdProject, createdMessage }
      }
    )

    await inngest.send({
      name: "code-agent/run",
      data: {
        projectId: createdProject.id,
        value: input.value,
      },
    })

    return createdMessage
  })

export const projectsRouter = {
  getMany,
  create,
}
