import { userRouter } from "./auth/router"
import { testingaiRouter } from "./testingai/router"

export const router = {
  user: userRouter,
  testingai: testingaiRouter,
}
