"use client"

import { FileExplorer } from "@/components/file-explorer"
import { Fragment } from "@/db/schema"
import { Button } from "@workspace/ui/components/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react"
import Link from "next/link"
import { Suspense, useState } from "react"
import { FragmentWeb } from "./fragment-web"
import { MessagesContainer } from "./messages-container"
import { ProjectHeader } from "./project-header"

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabsState, setTabsState] = useState<"preview" | "code">("preview")

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
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabsState}
            onValueChange={(value) => setTabsState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-fit! p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon /> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button size="sm" variant="default" asChild>
                  <Link href={`/pricing`}>
                    <CrownIcon /> <span>Upgrade</span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb fragment={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {!!activeFragment?.files && <FileExplorer files={activeFragment.files as { [path: string]: string }} />}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}