export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-svh max-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#dadde2_1px,transparent_1px)] bg-size-[16px_16px]" />
      <div className="flex-1 flex flex-col pb-4 min-h-0">
        {children}
      </div>
    </main>
  )
}