import { Sandbox } from "e2b"
import { openai, createAgent } from "@inngest/agent-kit"
import { inngest } from "@/inngest/client"
import { step } from "inngest"
import { getSandbox } from "@/inngest/utils"

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("nextjs-template-dev")
      return sandbox.sandboxId
    })

    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: "code-agent",
      system:
        "You are an expert nextjs developer.  You write readable, concise, simple code. You write simple Nextjs & React snippets.",
      model: openai({ model: "gpt-4o-mini" }),
    })

    const { output } = await codeAgent.run(
      `Write the following snippet of code: ${event.data.value}`
    )

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `http://${host}`
    })

    return { summary: output, sandboxUrl }
  }
)
