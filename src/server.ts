import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import helmet from "helmet";
import dotenv from "dotenv";

import { routes } from "./routes"

import { errorHandling } from "./middlewares/error-handling"
import uploadConfig from "./configs/upload"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors())
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER))
app.use(routes)

// app.use((_req: Request, res: Response) => {
//     res.status(404).json({ message: "Route not found" });
// });

app.use(errorHandling)


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
