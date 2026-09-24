"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("@/configs/auth");
const AppError_1 = require("@/utils/AppError");
function ensureAuthenticated(request, response, next) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new AppError_1.AppError("JWT token not found", 401);
        }
        const [, token] = authHeader.split(" ");
        const { role, sub: user_id } = (0, jsonwebtoken_1.verify)(token, auth_1.authConfig.jwt.secret);
        request.user = {
            id: user_id,
            role,
        };
        return next();
    }
    catch (error) {
        throw new AppError_1.AppError("Invalid JWT token", 401);
    }
}
