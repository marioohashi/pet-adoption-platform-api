import express, { Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";
import uploadConfig from "./configs/upload";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rota de Healthcheck
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Arquivos estáticos
app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER));

// Rotas da aplicação
app.use(routes);

// Rota 404 (para endpoints inexistentes)
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Middleware Global de Tratamento de Erros (SEMPRE O ÚLTIMO)
app.use(errorHandling);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));