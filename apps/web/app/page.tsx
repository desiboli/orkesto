import { AppHeader } from "@/components/app-header"

export default function Page() {
  return (
    <main>
      <AppHeader />
      <div className="flex min-h-svh p-6">
        <div className="flex max-w-lg justify-center items-center mx-auto min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-bold font-display uppercase text-6xl text-center">Build faster with Orkesto</h1>
            <p className="text-center text-muted-foreground font-mono text-lg">Design, development and AI tools for building modern brands and websites.</p>
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </div>
    </main>
  )
}
