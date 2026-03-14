import { z } from "zod"
import { toast } from "sonner"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpIcon, Loader2Icon } from "lucide-react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { orpc } from "@/lib/query/orpc"

interface Props {
  projectId: string
}

const formSchema = z.object({
  value: z.string().min(1, "Message cannot be empty.").max(1000, "Message cannot be more than 1000 characters."),
})

export const MessageForm = ({ projectId }: Props) => {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  })

  const createMessage = useMutation(
    orpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset()
        queryClient.invalidateQueries(
          orpc.messages.getMany.queryOptions({ input: { projectId } })
        )
        toast.success("Message created successfully")
      },
      onError: (error) => {
        console.error(error)
        toast.error(error.message)
      },
    })
  )

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createMessage.mutateAsync({
      projectId,
      value: data.value,
    })
  }

  const [isFocused, setIsFocused] = useState(false)
  const showUsage = false
  const isPending = createMessage.isPending
  const isDisabled = isPending || !form.formState.isValid

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn(
      "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
      isFocused && "shadow-xs",
      showUsage && "rounded-t-none"
    )}>
      <FieldGroup>
        <Controller
          name="value"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              {/* <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="Login button not working on mobile"
                autoComplete="off"
              /> */}
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What would you like to build?"
                className="pt-4 resize-none border-none outline-none bg-transparent w-full"
                minRows={2}
                maxRows={8}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    form.handleSubmit(onSubmit)(e)
                  }
                }}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button disabled={isDisabled} type="submit" size="icon" className={cn("size-8 rounded-full", isDisabled && "bg-muted-foreground border")}>
            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
          </Button>
        </div>

      </FieldGroup>
    </form>
  )
}