import { Router } from "express"
import { UsersController } from "@/controllers/users-controller"

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.create)

// listar todos
usersRoutes.get("/", usersController.index)

// listar um só
usersRoutes.get("/:id", usersController.show)

export { usersRoutes }
