import { Router } from "express"
import { UsersController } from "@/controllers/users-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { ensureAdmin } from "@/middlewares/ensure-admin";

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.create)

usersRoutes.use(ensureAuthenticated)

usersRoutes.put("/me", usersController.updateProfile)
usersRoutes.patch("/password", usersController.updatePassword)
usersRoutes.delete("/me", usersController.delete)
usersRoutes.delete("/:id",ensureAdmin, usersController.delete)
usersRoutes.get("/", ensureAdmin, usersController.index)

export { usersRoutes }