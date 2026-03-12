interface PageProps {
  params: Promise<{ websiteId: string }>
}

export default async function Page({ params }: PageProps) {
  const { websiteId } = await params

  return <div>Website {websiteId}</div>
}