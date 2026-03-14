"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { MessagesContainer } from "./messages-container"
import { Suspense, useState } from "react"
import { Fragment } from "@/db/schema"
import { ProjectHeader } from "./project-header"

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)

  return (
    <div className="h-screen">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          defaultSize="35%"
          minSize="20%"
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading messages...</div>}>
            <MessagesContainer projectId={projectId} activeFragment={activeFragment} setActiveFragment={setActiveFragment} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="65%" minSize="20%" className="flex flex-col min-h-0">
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}