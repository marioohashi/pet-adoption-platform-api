import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NgoController {
    // Listar todas (público)
    async index(req: Request, res: Response) {
        try {
            const ngos = await prisma.nGO.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.json(ngos);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar ONGs." });
        }
    }

    // Criar nova ONG (Apenas Admin)
    async store(req: Request, res: Response) {
        try {
            const { name, image, city, phone, website, description } = req.body;
            const userId = (req as any).user.id;

            const ngo = await prisma.nGO.create({
                data: { name, image, city, phone, website, description, userId },
            });

            return res.status(201).json(ngo);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao criar ONG." });
        }
    }

    // Atualizar ONG (Apenas Admin)
    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { name, image, city, phone, website, description } = req.body;

            const ngoExists = await prisma.nGO.findUnique({ where: { id } });
            if (!ngoExists) {
                return res.status(404).json({ error: "ONG não encontrada." });
            }

            const updatedNgo = await prisma.nGO.update({
                where: { id },
                data: { name, image, city, phone, website, description },
            });

            return res.json(updatedNgo);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar ONG." });
        }
    }

    // Remover ONG (Apenas Admin)
    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const ngoExists = await prisma.nGO.findUnique({ where: { id } });
            if (!ngoExists) {
                return res.status(404).json({ error: "ONG não encontrada." });
            }

            await prisma.nGO.delete({ where: { id } });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Erro ao remover ONG." });
        }
    }
}