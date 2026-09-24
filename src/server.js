"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const error_handling_1 = require("./middlewares/error-handling");
const upload_1 = __importDefault(require("./configs/upload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.use("/uploads", express_1.default.static(upload_1.default.UPLOADS_FOLDER));
// Rotas da aplicação
app.use(routes_1.routes);
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use(error_handling_1.errorHandling);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
