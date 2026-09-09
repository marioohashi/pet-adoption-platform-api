import { Router } from "express"
import { AnimalsController } from "@/controllers/animals-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

const animalsRoutes = Router()
const animalsController = new AnimalsController()

// Rotas públicas
animalsRoutes.get("/", animalsController.index)
animalsRoutes.get("/:id", animalsController.show)

// Rotas privadas
animalsRoutes.post("/", ensureAuthenticated, animalsController.create)
animalsRoutes.put("/:id", ensureAuthenticated, animalsController.update)
animalsRoutes.delete("/:id", ensureAuthenticated, animalsController.delete)

export { animalsRoutes }
