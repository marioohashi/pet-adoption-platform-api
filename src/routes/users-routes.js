"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const users_controller_1 = require("@/controllers/users-controller");
const usersRoutes = (0, express_1.Router)();
exports.usersRoutes = usersRoutes;
const usersController = new users_controller_1.UsersController();
usersRoutes.post("/", usersController.create);
// listar todos
usersRoutes.get("/", usersController.index);
// listar um só
usersRoutes.get("/:id", usersController.show);
