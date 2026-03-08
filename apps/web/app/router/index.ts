import { userRouter } from "@/features/auth/router"
import { testingaiRouter } from "@/features/testingai/router"

export const router = {
  user: userRouter,
  testingai: testingaiRouter,
}
