import { Router } from "express"
import { NgoController } from "@/controllers/ngo-controller" // Ajuste o caminho se necessário para o seu controller
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { ensureAdmin } from "@/middlewares/ensure-admin" // O middleware que valida se role === "admin"

const ngoRoutes = Router()
const ngoController = new NgoController()

ngoRoutes.get("/", ngoController.index)

ngoRoutes.post("/", ensureAuthenticated, ensureAdmin, ngoController.store)
ngoRoutes.put("/:id", ensureAuthenticated, ensureAdmin, ngoController.update)
ngoRoutes.delete("/:id", ensureAuthenticated, ensureAdmin, ngoController.delete)

export { ngoRoutes }    