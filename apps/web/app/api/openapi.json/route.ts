import { router } from "@/app/router"
import { OpenAPIGenerator } from "@orpc/openapi"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

export async function GET() {
  const spec = await generator.generate(router, {
    info: {
      title: "Orkesto API",
      version: "1.0.0",
    },
    servers: [{ url: "/api" }],
  })

  return Response.json(spec)
}
