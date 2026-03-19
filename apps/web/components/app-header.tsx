import orkestoLogo from "@/public/orkesto.svg"
import { Button } from "@workspace/ui/components/button"
import { LogOutIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function AppHeader() {
  return (
    <header>
      <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center p-4">
        <div className="justify-self-start">
          <Link href="/">
            <Image src={orkestoLogo} alt="Orkesto Logo" width={100} height={100} className="size-8 max-w-none" />
          </Link>
        </div>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <a href="https://orkesto.se" target="_blank" rel="noreferrer">Agency</a>
            </li>
            <li>
              <Link href="/website">Website</Link>
            </li>
          </ul>
        </nav>
        <div className="justify-self-end">
          <Button>
            <LogOutIcon />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}