"use client"

import { Input } from "@workspace/ui/components/input";
import { toast } from 'sonner';
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/query/orpc";

export function TestingAI() {
  const [value, setValue] = useState("")

  const invoke = useMutation(orpc.testingai.invokeBackgroundJob.mutationOptions({
    onSuccess: () => {
      toast.success("Background job invoked successfully")
    },
  }))

  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Testing AI" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={() => invoke.mutate({ value })}>Invoke background job</Button>
    </div>
  )
}
