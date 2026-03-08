"use client"

import { LoginForm } from "@/features/auth/components/login-form"
import orkestoLogo from "@/public/orkesto.svg"
import Image from "next/image"
import Link from "next/link"
import { LightRays } from "@workspace/ui/components/light-rays"

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-bold uppercase">
            <Image src={orkestoLogo} alt="Orkesto Logo" width={100} height={100} className="size-8 max-w-none" />
            Orkesto
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <LightRays />
      </div>
    </div>
  )
}