import { Template, waitForURL } from "e2b"

export const template: Parameters<typeof Template.build>[0] = Template()
  .fromNodeImage("22-slim")
  .aptInstall("curl")
  .setWorkdir("/home/user/nextjs-app")
  .runCmd(
    'npx --yes create-next-app@latest . --ts --tailwind --app --no-src-dir --no-eslint --no-react-compiler --import-alias "@/*" --use-npm --disable-git --turbopack'
  )
  .runCmd("npx --yes shadcn@latest init -d -f")
  .runCmd("npx --yes shadcn@latest add -a -y")
  .runCmd(
    "sed -i 's/@theme inline {/@theme inline {\\n  --font-sans: var(--font-sans);\\n  --font-mono: var(--font-mono);/' app/globals.css"
  )
  .runCmd(
    `cat > app/layout.tsx << 'LAYOUT'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "App",
  description: "Generated app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={\`\${geistSans.variable} \${geistMono.variable} font-sans antialiased\`}>
      <body>{children}</body>
    </html>
  );
}
LAYOUT`
  )
  .runCmd(
    "mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app"
  )
  .setWorkdir("/home/user")
  .setStartCmd("npx next --turbo", waitForURL("http://localhost:3000"))
