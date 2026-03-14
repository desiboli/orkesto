"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { MessagesContainer } from "./messages-container"
import { Suspense } from "react"

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  return (
    <div className="h-screen">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          defaultSize="35%"
          minSize="20%"
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading messages...</div>}>
            <MessagesContainer projectId={projectId} />
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