import { AppHeader } from "@/components/app-header"
import { ProjectForm } from "@/features/websites/home/components/project-form"
import { ProjectsList } from "@/features/websites/home/components/projects-list"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <>
      <AppHeader />

      <div className="flex flex-col max-w-5xl mx-auto w-full">
        <section className="space-y-6 py-[16vh] 2xl:py-48">
          <div className="flex flex-col items-center">
            <Image src="/orkesto.svg" alt="Orkesto Logo" width={50} height={50} className="hidden md:block" />
          </div>
          <h1 className="text-2xl md:text-5xl font-bold text-center">Build something with Orkesto</h1>
          <p className="text-lg md:text-xl text-center text-muted-foreground">Create apps and websites by chatting with AI</p>
          <div className="max-w-3xl mx-auto w-full">
            <ProjectForm />
          </div>
        </section>
        <ProjectsList />
        {/* <h1>Welcome {session.user.name}</h1>
      <TestingProjects />

      <LogoutButton /> */}
      </div>
    </>
  )
}