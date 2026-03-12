import { userRouter } from "@/features/auth/router"
import { messagesRouter } from "@/features/messages/router"
import { testingaiRouter } from "@/features/testingai/router"

export const router = {
  user: userRouter,
  testingai: testingaiRouter,
  messages: messagesRouter,
}
