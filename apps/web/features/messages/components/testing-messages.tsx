"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { orpc } from "@/lib/query/orpc"

export function TestingMessages() {
  const [value, setValue] = useState("")
  const queryClient = useQueryClient()

  const { data: messages, isLoading } = useQuery(
    orpc.messages.getMany.queryOptions()
  )

  const createMessage = useMutation(
    orpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created successfully")
        setValue("")
        queryClient.invalidateQueries({
          queryKey: orpc.messages.getMany.key(),
        })
      },
    })
  )

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Button
        disabled={createMessage.isPending || !value.trim()}
        onClick={() => createMessage.mutate({ value })}
      >
        Invoke Create message
      </Button>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(messages, null, 2)}</pre>
      )}
    </div>
  )
}