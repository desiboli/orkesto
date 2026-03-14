import { Hint } from "@/components/hint"
import { Fragment } from "@/db/schema"
import { Button } from "@workspace/ui/components/button"
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"

interface Props {
  fragment: Fragment
}

export const FragmentWeb = ({ fragment }: Props) => {
  const [fragmentKey, setFragmentKey] = useState(0)
  const [copied, setCopied] = useState(false)

  const onRefresh = () => {
    setFragmentKey(prev => prev + 1)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fragment.sandboxUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Click to copy">
          <Button size="sm" variant="outline" disabled={!fragment.sandboxUrl || copied} onClick={handleCopy} className="flex-1 justify-start font-normal text-start">
            <span className="truncate">
              {fragment.sandboxUrl}
            </span>
          </Button>
        </Hint>
        <Hint text="Open in new tab">
          <Button size="sm" variant="outline" disabled={!fragment.sandboxUrl} onClick={() => {
            if (!fragment.sandboxUrl) return;
            window.open(fragment.sandboxUrl, "_blank")
          }}>
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe key={fragmentKey} src={fragment.sandboxUrl} className="w-full h-full" sandbox="allow-scripts allow-same-origin allow-forms" loading="lazy" />
    </div>
  )
}