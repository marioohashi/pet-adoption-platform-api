"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animalsRoutes = void 0;
const express_1 = require("express");
const animals_controller_1 = require("@/controllers/animals-controller");
const ensure_authenticated_1 = require("@/middlewares/ensure-authenticated");
const animalsRoutes = (0, express_1.Router)();
exports.animalsRoutes = animalsRoutes;
const animalsController = new animals_controller_1.AnimalsController();
// Rotas públicas
animalsRoutes.get("/", animalsController.index);
animalsRoutes.get("/:id", animalsController.show);
// Rotas privadas
animalsRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, animalsController.create);
animalsRoutes.put("/:id", ensure_authenticated_1.ensureAuthenticated, animalsController.update);
animalsRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, animalsController.delete);
