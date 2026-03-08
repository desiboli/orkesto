# oRPC Guide

This is a beginner-friendly guide for how oRPC is set up in this project and how to extend it safely.

## Big Picture

In this app, oRPC gives you one shared router and two ways to expose it:

- `apps/web/app/rpc/[[...rest]]/route.ts` exposes the router over the oRPC protocol at `/rpc`
- `apps/web/app/api/[[...rest]]/route.ts` exposes the same router over REST/OpenAPI at `/api`
- `apps/web/app/api/openapi.json/route.ts` generates the OpenAPI spec
- `apps/web/app/api/docs/route.ts` shows the Scalar API docs UI

That means you define procedures once, then you can:

- call them with the typed oRPC client in your app
- call them as normal REST endpoints
- see them in the generated OpenAPI docs

## File Map

### `apps/web/app/router/index.ts`

This is the main app router. It combines feature routers:

```ts
import { userRouter } from "@/features/auth/router"
import { testingaiRouter } from "@/features/testingai/router"

export const router = {
  user: userRouter,
  testingai: testingaiRouter,
}
```

If you add a new feature router, this is where you register it.

### `apps/web/app/router/procedures.ts`

This file defines your reusable procedure bases:

- `publicProcedure` for endpoints that do not require auth
- `authedProcedure` for endpoints that require a session

`authedProcedure` reads `headers` from context and resolves the session through Better Auth.

### `apps/web/features/auth/router.ts`

This is your first feature router. Right now it contains:

```ts
export const userRouter = {
  me,
}
```

And the `me` procedure:

```ts
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
```

### `apps/web/lib/orpc.ts`

This is the browser/client-side entry point. It uses `RPCLink` and talks to `/rpc`.

Use this in client components when you want to call procedures from the browser.

### `apps/web/lib/orpc.server.ts`

This creates a server-side router client with request headers attached.

Use this in server-side code when you want to call router procedures directly with the same types.

### `apps/web/instrumentation.ts`

This imports `orpc.server.ts` during app startup so the server client is available globally.

### `apps/web/lib/query/orpc.ts`

This exports `orpc`, the TanStack Query utils for oRPC. Use it with `useQuery`, `useMutation`, etc.

### `apps/web/lib/query/client.ts` and `apps/web/lib/query/hydration.tsx`

Query client factory and hydration helpers for SSR. The app uses `StandardRPCJsonSerializer` so oRPC types serialize correctly when hydrating from server to client.

### `apps/web/app/providers.tsx`

Wraps the app in `QueryClientProvider`. Used in the root layout.

## URLs You Can Use

- `http://localhost:3000/rpc` - oRPC endpoint used by the typed client
- `http://localhost:3000/api` - REST/OpenAPI endpoint base
- `http://localhost:3000/api/openapi.json` - generated OpenAPI JSON
- `http://localhost:3000/api/docs` - Scalar API docs UI

## Core Idea

The normal workflow is:

1. Create a procedure with `publicProcedure` or `authedProcedure`
2. Optionally add `.input(...)` if it accepts input
3. Add `.output(...)` so the result shape is explicit and OpenAPI can document it
4. Add `.route(...)` so it gets a REST path and method
5. Export it inside a feature router
6. Register that feature router in `apps/web/app/router/index.ts`

## When To Use Each Procedure Base

### `publicProcedure`

Use this when the endpoint is safe for anonymous users.

Examples:

- health check
- public marketing data
- a list of public projects

What context is available:

- `headers`

### `authedProcedure`

Use this when the endpoint requires a logged-in user.

Examples:

- current user profile
- create project
- list a user's private projects

What context is available:

- `headers`
- `user`
- `session`

## Step By Step: Add A Simple Public Procedure

Let's say you want to add a small public endpoint that returns a friendly message.

### 1. Create a feature router

Create a file like `apps/web/features/projects/router.ts`:

```ts
import "server-only"

import * as z from "zod"
import { publicProcedure } from "@/app/router/procedures"

const ProjectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const list = publicProcedure
  .route({ method: "GET", path: "/projects" })
  .output(z.array(ProjectSummarySchema))
  .handler(async () => {
    return [
      { id: "p_1", name: "Starter Project" },
      { id: "p_2", name: "Internal Dashboard" },
    ]
  })

export const projectsRouter = {
  list,
}
```

What this gives you:

- oRPC call path: `client.projects.list()`
- REST endpoint: `GET /api/projects`
- OpenAPI docs entry in `/api/openapi.json` and `/api/docs`

### 2. Register the router

Update `apps/web/app/router/index.ts`:

```ts
import { userRouter } from "@/features/auth/router"
import { projectsRouter } from "@/features/projects/router"

export const router = {
  user: userRouter,
  projects: projectsRouter,
}
```

### 3. Call it from a client component

Use `useQuery` from TanStack Query with the `orpc` utils:

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

export function ProjectList() {
  const { data: projects, isLoading } = useQuery(
    orpc.projects.list.queryOptions()
  )

  if (isLoading) return <p>Loading...</p>

  return (
    <ul>
      {projects?.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
```

Or prefetch on the server and hydrate on the client for no loading state:

```tsx
// app/projects/page.tsx (server component)
import { getQueryClient, HydrateClient } from "@/lib/query/hydration"
import { orpc } from "@/lib/query/orpc"
import { ProjectList } from "./project-list"

export default async function ProjectsPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(orpc.projects.list.queryOptions())

  return (
    <HydrateClient client={queryClient}>
      <ProjectList />
    </HydrateClient>
  )
}
```

```tsx
// app/projects/project-list.tsx (client component)
"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

export function ProjectList() {
  const { data: projects } = useSuspenseQuery(
    orpc.projects.list.queryOptions()
  )

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
```

### 4. Call it via REST

```bash
curl http://localhost:3000/api/projects
```

## Step By Step: Add An Authenticated Procedure

Now let's add a procedure that only works for logged-in users.

Example: `projects.mine`

Create or extend `apps/web/features/projects/router.ts`:

```ts
import "server-only"

import * as z from "zod"
import { authedProcedure, publicProcedure } from "@/app/router/procedures"

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
})

export const list = publicProcedure
  .route({ method: "GET", path: "/projects" })
  .output(z.array(ProjectSchema.pick({ id: true, name: true, ownerId: true })))
  .handler(async () => {
    return []
  })

export const mine = authedProcedure
  .route({ method: "GET", path: "/projects/mine" })
  .output(z.array(ProjectSchema))
  .handler(async ({ context }) => {
    const userId = context.user.id

    return [
      { id: "p_1", name: "My First Project", ownerId: userId },
    ]
  })

export const projectsRouter = {
  list,
  mine,
}
```

Important detail:

- `authedProcedure` gives you `context.user`
- if the user is not logged in, the procedure throws `UNAUTHORIZED`

### Call it in app code

```ts
const myProjects = await client.projects.mine()
```

### Call it via REST

```bash
curl http://localhost:3000/api/projects/mine
```

This only works if the request includes a valid session cookie.

## Step By Step: Add A Procedure With Input

If your procedure accepts data, add `.input(...)`.

Example: create a project.

```ts
import * as z from "zod"
import { authedProcedure } from "@/app/router/procedures"

const CreateProjectInput = z.object({
  name: z.string().min(1),
})

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
})

export const create = authedProcedure
  .route({ method: "POST", path: "/projects" })
  .input(CreateProjectInput)
  .output(ProjectSchema)
  .handler(async ({ input, context }) => {
    return {
      id: crypto.randomUUID(),
      name: input.name,
      ownerId: context.user.id,
    }
  })
```

What happens here:

- `.input(...)` validates the payload
- `input.name` is fully typed
- `.route(...)` maps it to `POST /api/projects`
- `.output(...)` documents the response shape in OpenAPI

### Call it from the app

```ts
await client.projects.create({
  name: "New Project",
})
```

### Call it via REST

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project"}'
```

For authenticated procedures, the browser usually sends cookies automatically. In tools like curl or Postman, you need to provide auth/session manually.

## Step By Step: Add A New Feature Router

If you are building a whole new domain, use this checklist.

### 1. Create a router file

Example:

- `apps/web/features/projects/router.ts`
- `apps/web/features/billing/router.ts`
- `apps/web/features/teams/router.ts`

### 2. Add one or more procedures

Each procedure should usually follow this order:

```ts
export const example = publicProcedure
  .route({ method: "GET", path: "/example" })
  .input(SomeInputSchema) // optional
  .output(SomeOutputSchema)
  .handler(async ({ input, context }) => {
    return result
  })
```

### 3. Export the feature router object

```ts
export const projectsRouter = {
  list,
  create,
  mine,
}
```

### 4. Register it in `apps/web/app/router/index.ts`

```ts
export const router = {
  user: userRouter,
  projects: projectsRouter,
}
```

That is what makes it available to:

- `client.projects.*`
- `/api/projects*`
- OpenAPI docs

## TanStack React Query

This project uses `@orpc/tanstack-query` so you can call procedures via `useQuery`, `useMutation`, and friends. Import `orpc` from `@/lib/query/orpc`.

### Queries

Use `.queryOptions()` with `useQuery` or `useSuspenseQuery`:

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

export function UserProfile() {
  const { data, isLoading, error } = useQuery(
    orpc.user.me.queryOptions()
  )

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return <p>Hello, {data?.name}</p>
}
```

For procedures that take input:

```tsx
useQuery(orpc.projects.find.queryOptions({ input: { id: "p_1" } }))
```

### Mutations

Use `.mutationOptions()` with `useMutation`:

```tsx
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

export function CreateProjectForm() {
  const queryClient = useQueryClient()
  const mutation = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.key() })
      },
    })
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate({ name: "New Project" })
      }}
    >
      <button type="submit" disabled={mutation.isPending}>
        Create
      </button>
    </form>
  )
}
```

### Cache invalidation

Use `orpc.*.key()` for partial matching:

```ts
queryClient.invalidateQueries({ queryKey: orpc.user.key() })
queryClient.invalidateQueries({ queryKey: orpc.user.me.key() })
```

### Server-side prefetch and hydration

Prefetch in a server component, then hydrate so the client does not refetch:

```tsx
// app/dashboard/page.tsx
import { getQueryClient, HydrateClient } from "@/lib/query/hydration"
import { orpc } from "@/lib/query/orpc"
import { UserProfile } from "@/components/user-profile"

export default async function DashboardPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(orpc.user.me.queryOptions())

  return (
    <HydrateClient client={queryClient}>
      <UserProfile />
    </HydrateClient>
  )
}
```

```tsx
// components/user-profile.tsx
"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

export function UserProfile() {
  const { data } = useSuspenseQuery(orpc.user.me.queryOptions())
  return <p>Hello, {data.name}</p>
}
```

The prefetched data is hydrated into the client, so `useSuspenseQuery` resolves immediately without a network request.

### skipToken for conditional queries

When you want to disable a query based on missing input:

```tsx
import { skipToken } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

const { data } = useQuery(
  orpc.projects.find.queryOptions({
    input: projectId ? { id: projectId } : skipToken,
  })
)
```

## Calling Procedures From Different Places

### From a client component (recommended: TanStack Query)

Use `orpc` from `@/lib/query/orpc` with `useQuery` or `useSuspenseQuery`:

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/query/orpc"

const { data } = useQuery(orpc.user.me.queryOptions())
```

### From a server component

Call the client directly -- server components are async by default:

```tsx
import { client } from "@/lib/orpc"

export default async function DashboardPage() {
  const me = await client.user.me()
  return <p>Hello, {me.name}</p>
}
```

Or prefetch and hydrate if a child client component also needs the data:

```tsx
import { getQueryClient, HydrateClient } from "@/lib/query/hydration"
import { orpc } from "@/lib/query/orpc"

export default async function DashboardPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(orpc.user.me.queryOptions())

  return (
    <HydrateClient client={queryClient}>
      <UserProfile />
    </HydrateClient>
  )
}
```

### Via REST

Use `/api/...`.

Examples:

```bash
curl http://localhost:3000/api/users/me
curl http://localhost:3000/api/projects
curl -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -d '{"name":"Demo"}'
```

### Via docs UI

Use:

- `/api/docs`

This reads from:

- `/api/openapi.json`

## OpenAPI Tips

If you want a procedure to show up nicely in your REST API and docs:

### Always add `.route(...)`

Without `.route(...)`, you still have an oRPC procedure, but it does not have a clear REST method/path definition.

Example:

```ts
.route({ method: "GET", path: "/projects/{id}" })
```

### Add `.input(...)` for request data

This is how OpenAPI knows the expected input shape.

For path params, include them in the input schema:

```ts
const GetProjectInput = z.object({
  id: z.string(),
})
```

### Add `.output(...)` for response data

This improves:

- generated OpenAPI spec
- docs quality
- explicit typing

## Suggested Folder Convention

Features are colocated under `features/<name>/`. For each new feature:

```text
apps/web/features/projects/
  router.ts
  components/
```

If a feature uses Inngest background jobs, add them alongside:

```text
apps/web/features/projects/
  router.ts
  functions.ts
  components/
```

If a feature grows, you can expand it later:

```text
apps/web/features/projects/
  router.ts
  schemas.ts
  service.ts
  components/
```

Keep it simple at first. Only split files when the router starts getting crowded.

## Common Mistakes

### Forgetting to register the feature router

If you create `features/projects/router.ts` but forget to add it to `app/router/index.ts`, nothing can call it.

### Using `publicProcedure` for private data

If the handler needs the current user, use `authedProcedure`.

### Forgetting `.output(...)`

The procedure may still work, but your OpenAPI docs will be weaker and less explicit.

### Forgetting `.route(...)`

The typed oRPC call may still work, but the REST/OpenAPI side will be incomplete.

### Putting browser-only code in server routers

Router files should stay server-safe.

## Quick Recipe

When adding a new endpoint, use this checklist:

1. Pick `publicProcedure` or `authedProcedure`
2. Define Zod input/output schemas
3. Add `.route(...)`
4. Add `.input(...)` if needed
5. Add `.output(...)`
6. Write the `.handler(...)`
7. Export it from the feature router
8. Register the feature router in `app/router/index.ts`
9. Test it in:
   - app code with `client.*`
   - REST at `/api/...`
   - docs at `/api/docs`

## Current Example In This Project

If you want one real reference, start with:

- `apps/web/app/router/procedures.ts`
- `apps/web/features/auth/router.ts`
- `apps/web/features/testingai/router.ts`
- `apps/web/app/router/index.ts`

That is the smallest complete example already working in this codebase.

Features use colocation: each feature lives under `features/<name>/` with its `router.ts`, `components/`, and optionally `functions.ts` (for Inngest jobs). Register routers in `app/router/index.ts` and Inngest functions in `app/api/inngest/route.ts`.
