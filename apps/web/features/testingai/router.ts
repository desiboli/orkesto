import "server-only"

import * as z from "zod"
import { authedProcedure } from "@/app/router/procedures"
import { inngest } from "@/inngest/client"

const InvokeBackgroundJobInput = z.object({
  value: z.string(),
})

export const invokeBackgroundJob = authedProcedure
  .route({ method: "POST", path: "/testingai/invoke-background-job" })
  .input(InvokeBackgroundJobInput)
  .handler(async ({ input }) => {
    await inngest.send({
      name: "code-agent/run",
      data: {
        value: input.value,
      },
    })

    return { ok: "success" }
  })

export const testingaiRouter = {
  invokeBackgroundJob,
}
