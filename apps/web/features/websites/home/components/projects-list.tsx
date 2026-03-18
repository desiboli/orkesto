"use client"

import { orpc } from "@/lib/query/orpc"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

export const ProjectsList = () => {
  const { data: projects } = useQuery(
    orpc.projects.getMany.queryOptions()
  )

  return (
    <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
      <h2 className="text-2xl font-semibold">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        )}
        {projects?.map((project) => (
          <Button key={project.id} variant="outline" className="font-normal h-auto justify-start w-full text-start p-4" asChild>
            <Link href={`/website/${project.id}`}>
              <Image
                src={"/orkesto.svg"}
                alt="Orkesto Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <div className="flex flex-col">
                <h3 className="truncate font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}