import { Request, Response, NextFunction } from "express"

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user

    if (!user) {
        return res.status(401).json({ message: "Usuário não autenticado." })
    }

    if (user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem realizar esta ação." })
    }

    return next()
}