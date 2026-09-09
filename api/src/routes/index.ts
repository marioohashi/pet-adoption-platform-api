import { Router } from "express"

import { usersRoutes } from "./users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { animalsRoutes } from "./animals-routes"
import { uploadsRoutes } from "./uploads-routes"

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

const routes = Router()

// Rotas publicas.
routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/animals", animalsRoutes)

// Rotas privadas.
routes.use(ensureAuthenticated)
// routes.use("/refunds", refundsRoutes)
routes.use("/uploads", uploadsRoutes)

export { routes }