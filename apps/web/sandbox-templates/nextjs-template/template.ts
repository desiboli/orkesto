import { Template, waitForURL } from 'e2b'

export const template: Parameters<typeof Template.build>[0] = Template()
  .fromNodeImage('21-slim')
  .aptInstall('curl')
  .setWorkdir('/home/user/nextjs-app')
  .runCmd(
    'npx --yes create-next-app@latest . --ts --tailwind --no-eslint --no-react-compiler --import-alias "@/*" --use-npm --no-app --no-src-dir --turbopack'
  )
  .runCmd('npx --yes shadcn@latest init -d -f')
  .runCmd('npx --yes shadcn@latest add -a -y')
  .runCmd(
    'mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app'
  )
  .setWorkdir('/home/user')
  .setStartCmd('npx next --turbo', waitForURL('http://localhost:3000'))
