"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { orpc } from "@/lib/query/orpc"
import { useRouter } from "next/navigation"

export function TestingProjects() {
  const router = useRouter()
  const [value, setValue] = useState("")

  const createProject = useMutation(
    orpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: (data) => {
        router.push(`/website/${data.id}`)
      },
    })
  )

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-y-4 flex-col">
        <Input
          placeholder="Project"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Button
          disabled={createProject.isPending || !value.trim()}
          onClick={() => createProject.mutate({ value })}
        >
          Submit
        </Button>
      </div>
    </div>
  )
}