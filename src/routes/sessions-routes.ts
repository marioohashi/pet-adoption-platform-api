import { Router } from "express"

import { SessionsController } from "@/controllers/sessions-controller"

const sessionsRoutes = Router()
const sessionsController = new SessionsController()

sessionsRoutes.post("/", sessionsController.create)
sessionsRoutes.post("/google", sessionsController.google)

export { sessionsRoutes }
