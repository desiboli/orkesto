import Prism from "prismjs"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-typescript"
import { useEffect } from "react"

import { cn } from "@workspace/ui/lib/utils"
import "./code-theme.css"

interface Props {
  code: string
  language: string
}

export const CodeView = ({ code, language }: Props) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  return (
    <pre className={cn(`language-${language}`, "p-2 bg-transparent border-none rounded-none m-0 text-xs")}>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  )
}