import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VetController {
    async index(req: Request, res: Response) {
        try {
            const vets = await prisma.vetPartner.findMany({
                orderBy: { createdAt: "desc" },
            });
            return res.json(vets);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar parceiros veterinários." });
        }
    }

    async store(req: Request, res: Response) {
        try {
            const { name, type, image, city, state, phone, address, hours, specialty, description, crmv, website } = req.body;
            const userId = (req as any).user.id;

            const vet = await prisma.vetPartner.create({
                data: {
                    name,
                    type,
                    image,
                    city,
                    state,
                    phone,
                    crmv,
                    website,
                    address,
                    hours,
                    specialty,
                    description,
                    userId,
                },
            });

            return res.status(201).json(vet);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao criar parceiro veterinário." });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { name, type, image, city, state, phone, address, hours, specialty, description, crmv } = req.body;

            const vetExists = await prisma.vetPartner.findUnique({ where: { id } });
            if (!vetExists) {
                return res.status(404).json({ error: "Parceiro veterinário não encontrado." });
            }

            const updatedVet = await prisma.vetPartner.update({
                where: { id },
                data: {
                    name,
                    type,
                    image,
                    city,
                    state,
                    crmv,
                    phone,
                    address,
                    hours,
                    specialty,
                    description,
                },
            });

            return res.json(updatedVet);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao atualizar parceiro veterinário." });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

            const vetExists = await prisma.vetPartner.findUnique({ where: { id } });
            if (!vetExists) {
                return res.status(404).json({ error: "Parceiro veterinário não encontrado." });
            }

            await prisma.vetPartner.delete({ where: { id } });

            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao remover parceiro veterinário." });
        }
    }
}