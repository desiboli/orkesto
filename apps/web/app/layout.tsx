import { Geist_Mono, Outfit, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import "../lib/orpc.server" // for pre-rendering
// import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider } from "next-themes"
import { Providers } from "@/app/providers"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable, spaceGrotesk.variable)}
    >
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
