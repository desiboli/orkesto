import { openai, createAgent } from "@inngest/agent-kit"
import { inngest } from "./client"

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
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

    return { summary: output }
  }
)
