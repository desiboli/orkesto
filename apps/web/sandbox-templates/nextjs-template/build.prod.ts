import dotenv from "dotenv"
dotenv.config({ path: "../../.env" })
import { Template, defaultBuildLogger } from "e2b"
import { template } from "./template"

async function main() {
  await Template.build(template, "nextjs-template", {
    cpuCount: 4,
    memoryMB: 4096,
    onBuildLogs: defaultBuildLogger(),
  })
}

main().catch(console.error)
