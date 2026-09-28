import { Router } from "express"
import { VetController } from "@/controllers/vet-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { ensureAdmin } from "@/middlewares/ensure-admin"

const vetRoutes = Router()
const vetController = new VetController()

vetRoutes.get("/", vetController.index)
vetRoutes.post("/", ensureAuthenticated, ensureAdmin, vetController.store)
vetRoutes.put("/:id", ensureAuthenticated, ensureAdmin, vetController.update)
vetRoutes.delete("/:id", ensureAuthenticated, ensureAdmin, vetController.delete)

export { vetRoutes }