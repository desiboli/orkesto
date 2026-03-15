import { ProjectView } from "@/features/projects/components/project-view"
import { getQueryClient, HydrateClient } from "@/lib/query/hydration"
import { orpc } from "@/lib/query/orpc"
import { notFound } from "next/navigation"
import { Suspense } from "react"

interface PageProps {
  params: Promise<{ websiteId: string }>
}

export default async function Page({ params }: PageProps) {
  const { websiteId } = await params

  const queryClient = getQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(orpc.messages.getMany.queryOptions({ input: { projectId: websiteId } })),
    queryClient.prefetchQuery(orpc.projects.getOne.queryOptions({ input: { params: { id: websiteId } } })),
  ])

  const projectData = queryClient.getQueryData(
    orpc.projects.getOne.queryOptions({ input: { params: { id: websiteId } } }).queryKey,
  )
  if (!projectData) {
    notFound()
  }

  return (
    <HydrateClient client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectView projectId={websiteId} />
      </Suspense>
    </HydrateClient>
  )
}