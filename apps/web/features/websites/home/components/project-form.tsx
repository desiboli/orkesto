"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowUpIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import TextareaAutosize from "react-textarea-autosize"
import { toast } from "sonner"
import { z } from "zod"

import { orpc } from "@/lib/query/orpc"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import { useRouter } from "next/navigation"
import { PROJECT_TEMPLATES } from "../constants"

const formSchema = z.object({
  value: z.string().min(1, "Message cannot be empty.").max(1000, "Message cannot be more than 1000 characters."),
})

export const ProjectForm = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  })

  const createProject = useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          orpc.projects.getMany.queryOptions()
        )
        router.push(`/website/${data.id}`)
      },
      onError: (error) => {
        console.error(error)
        toast.error(error.message)
      },
    })
  )

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createProject.mutateAsync({
      value: data.value,
    })
  }

  const onSelect = (prompt: string) => {
    form.setValue("value", prompt, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }

  const [isFocused, setIsFocused] = useState(false)
  const isPending = createProject.isPending
  const isDisabled = isPending || !form.formState.isValid

  return (
    <section className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(
        "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
        isFocused && "shadow-xs",
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
      <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
        {PROJECT_TEMPLATES.map((template) => (
          <Button
            key={template.title}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-sidebar"
            onClick={() => onSelect(template.prompt)}
            disabled={isPending}
          >
            {template.emoji} {template.title}
          </Button>
        ))}
      </div>
    </section>
  )
}