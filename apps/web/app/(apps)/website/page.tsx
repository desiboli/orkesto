import { LogoutButton } from "@/features/auth/components/logout-button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TestingAI } from "@/features/testingai/components/testingai"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1>Welcome {session.user.name}</h1>
      <TestingAI />

      <LogoutButton />
    </div>
  )
}