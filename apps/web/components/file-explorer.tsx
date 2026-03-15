import { convertFilesToTreeItems } from "@/lib/utils";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { CodeView } from "./code-view";
import { Hint } from "./hint";
import { TreeView } from "./tree-view";

type FileCollection = { [path: string]: string }

function getLanguageFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase()
  return extension || "txt";
}

interface FileBreadcrumbProps {
  filePath: string
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split("/")
  const maxSegments = 4

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      return pathSegments.map((segment: string, index: number) => {
        const isLast = index === pathSegments.length - 1

        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">
                  {segment}
                </span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        )
      })
    } else {
      const firstSegment = pathSegments[0]
      const lastSegment = pathSegments[pathSegments.length - 1]

      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">
              {firstSegment}
            </span>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {lastSegment}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbItem>
        </>
      )
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {renderBreadcrumbItems()}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

interface FileExplorerProps {
  files: FileCollection
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const firstFile = Object.keys(files)[0]
    return firstFile || null
  })

  const treeData = useMemo(() => convertFilesToTreeItems(files), [files])

  const handleFileSelect = useCallback((filePath: string) => {
    if (files[filePath]) {
      setSelectedFile(filePath)
    }
  }, [files])

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile] || "")
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }, [selectedFile, files])

  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="30%" minSize="30%" className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-background transition-colors" />
      <ResizablePanel defaultSize="70%" minSize="70%" className="bg-sidebar">
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="py-2 px-4 border-b bg-sidebar flex items-center justify-between gap-x-2">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom">
                <Button size="icon" variant="outline" className="ml-auto" onClick={handleCopy} disabled={copied}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView code={files[selectedFile]} language={getLanguageFromExtension(selectedFile)} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No file selected</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}