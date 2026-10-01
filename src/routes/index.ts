import { Router } from "express"

import { usersRoutes } from "./users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { petsRoutes } from "./pets-routes"
import { ngoRoutes } from "./ngo-routes"
import { vetRoutes } from "./vet-routes"

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

const routes = Router()

// Rotas publicas.
routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/pets", petsRoutes)
routes.use("/ngos", ngoRoutes)
routes.use("/vets", vetRoutes)

// Rotas privadas.
routes.use(ensureAuthenticated)

export { routes }