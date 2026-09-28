import { Router } from "express"
import multer from "multer"
import uploadConfig from "@/configs/upload"
import { AnimalsController } from "@/controllers/animals-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

const animalsRoutes = Router()
const animalsController = new AnimalsController()
const upload = multer(uploadConfig.MULTER)

// Rota pública de listagem
animalsRoutes.get("/", animalsController.index)

// Rota PRIVADA do usuário (deve ficar antes de GET /:id)
animalsRoutes.get("/me", ensureAuthenticated, animalsController.me)

// Rota pública por ID
animalsRoutes.get("/:id", animalsController.show)

// 🟢 Rotas privadas com o upload de até 5 fotos via Multer
animalsRoutes.post("/", ensureAuthenticated, upload.array("photos", 5), animalsController.create)
animalsRoutes.put("/:id", ensureAuthenticated, upload.array("photos", 5), animalsController.update)

animalsRoutes.delete("/:id", ensureAuthenticated, animalsController.delete)

export { animalsRoutes }