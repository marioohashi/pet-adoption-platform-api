import { Router } from "express"
import multer from "multer"
import uploadConfig from "@/configs/upload"
import { PetsController } from "@/controllers/pets-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

const petsRoutes = Router()
const petsController = new PetsController()
const upload = multer(uploadConfig.MULTER)

// Rota pública de listagem (agora suportando filtros por type, species, city, etc.)
petsRoutes.get("/", petsController.index)

// Rota PRIVADA do usuário logado (deve ficar antes de GET /:id)
petsRoutes.get("/me", ensureAuthenticated, petsController.me)

// Rota pública por ID
petsRoutes.get("/:id", petsController.show)

// 🟢 Rotas privadas com o upload de até 5 fotos via Multer
petsRoutes.post("/", ensureAuthenticated, upload.array("photos", 5), petsController.create)
petsRoutes.put("/:id", ensureAuthenticated, upload.array("photos", 5), petsController.update)

petsRoutes.delete("/:id", ensureAuthenticated, petsController.delete)

export { petsRoutes }