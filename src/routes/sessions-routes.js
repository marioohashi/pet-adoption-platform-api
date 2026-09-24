"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRoutes = void 0;
const express_1 = require("express");
const sessions_controller_1 = require("@/controllers/sessions-controller");
const sessionsRoutes = (0, express_1.Router)();
exports.sessionsRoutes = sessionsRoutes;
const sessionsController = new sessions_controller_1.SessionsController();
sessionsRoutes.post("/", sessionsController.create);
