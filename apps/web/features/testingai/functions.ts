import { Sandbox } from "e2b"
import {
  openai,
  anthropic,
  createAgent,
  createTool,
  createNetwork,
  Tool,
} from "@inngest/agent-kit"
import { inngest } from "@/inngest/client"
import { step } from "inngest"
import { getSandbox, lastAssistantTextMessageContent } from "@/inngest/utils"
import { z } from "zod"
import { PROMPT } from "@/prompt"
import { db } from "@/db/drizzle"
import { fragment, message } from "@/db/schema"

interface AgentState {
  summary: string
  files: { [path: string]: string }
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("nextjs-template-dev")
      return sandbox.sandboxId
    })

    const projectContext = await step.run("get-project-context", async () => {
      const sandbox = await getSandbox(sandboxId)
      const tree = await sandbox.commands.run(
        "find /home/user -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.next/*' -type f",
        { timeoutMs: 10000 }
      )
      return tree.stdout
    })

    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      // model: anthropic({
      //   model: "claude-sonnet-4-20250514",
      //   defaultParameters: {
      //     max_tokens: 4096,
      //   },
      // }),
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" }

              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(command, {
                  timeoutMs: 60000,
                  onStdout(data: string) {
                    buffers.stdout += data
                  },
                  onStderr(data: string) {
                    buffers.stderr += data
                  },
                })

                return result.stdout
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                )
                return `ERROR: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
              }
            })
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {}
                  const sandbox = await getSandbox(sandboxId)
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content)
                    updatedFiles[file.path] = file.content
                  }
                  return updatedFiles
                } catch (error) {
                  console.error(`Failed to create or update files: ${error}`)
                  return "Error: " + error
                }
              }
            )

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const contents = []
                for (const file of files) {
                  const content = await sandbox.files.read(file)
                  contents.push({ path: file, content })
                }
                return JSON.stringify(contents)
              } catch (error) {
                console.error(`Failed to read files: ${error}`)
                return "Error: " + error
              }
            })
          },
        }),
        createTool({
          name: "listFiles",
          description:
            "List files and directories in the sandbox at a given path. Returns the directory tree.",
          parameters: z.object({
            path: z
              .string()
              .describe(
                "Absolute path to list, e.g. /home/user or /home/user/components/ui"
              ),
          }),
          handler: async ({ path }, { step }) => {
            return await step?.run("listFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(
                  `find ${path} -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.next/*'`,
                  { timeoutMs: 10000 }
                )
                return result.stdout
              } catch (error) {
                return `Error listing files: ${error}`
              }
            })
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result)

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText
            }
          }

          return result
        },
      },
    })

    const network = createNetwork<AgentState>({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 25,
      router: async ({ network }) => {
        const summary = network.state.data.summary

        if (summary) {
          return
        }

        return codeAgent
      },
    })

    const prompt = `<project_structure>\n${projectContext}\n</project_structure>\n\n<user_request>\n${event.data.value}\n</user_request>`
    const result = await network.run(prompt)

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `http://${host}`
    })

    await step.run("save-result", async () => {
      if (isError) {
        return await db.insert(message).values({
          projectId: event.data.projectId,
          content: "Something went wrong. Please try again.",
          role: "ASSISTANT",
          type: "ERROR",
        })
      }

      return await db.transaction(async (tx) => {
        const [createdMessage] = await tx
          .insert(message)
          .values({
            projectId: event.data.projectId,
            content: result.state.data.summary,
            role: "ASSISTANT",
            type: "RESULT",
          })
          .returning({ id: message.id })

        if (!createdMessage) {
          throw new Error("Failed to create message")
        }

        await tx.insert(fragment).values({
          messageId: createdMessage.id,
          sandboxUrl,
          title: "Fragment",
          files: result.state.data.files,
        })
        return createdMessage
      })
    })

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  }
)
