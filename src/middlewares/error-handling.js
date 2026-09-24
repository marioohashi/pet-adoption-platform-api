"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandling = void 0;
const AppError_1 = require("@/utils/AppError");
const zod_1 = require("zod");
const errorHandling = (error, _request, response, _next) => {
    if (error instanceof AppError_1.AppError) {
        response.status(error.statusCode).json({ message: error.message });
        return;
    }
    if (error instanceof zod_1.ZodError) {
        response.status(400).json({
            message: "validation error",
            issues: error.format(),
        });
        return;
    }
    response.status(500).json({ message: error.message });
    return;
};
exports.errorHandling = errorHandling;
