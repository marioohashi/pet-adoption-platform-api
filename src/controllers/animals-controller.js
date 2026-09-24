"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimalsController = void 0;
const AppError_1 = require("@/utils/AppError");
const prisma_1 = require("@/database/prisma");
const zod_1 = require("zod");
const SpeciesEnum = zod_1.z.enum(["cat", "dog", "other"]);
class AnimalsController {
    async create(request, response) {
        if (!request.user?.id) {
            throw new AppError_1.AppError("Não autorizado", 401);
        }
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            species: SpeciesEnum.default("other"),
            breed: zod_1.z.string().optional(),
            age: zod_1.z.number().optional(),
            size: zod_1.z.string().optional(),
            sex: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            photo: zod_1.z.string().optional(),
        });
        const data = bodySchema.parse(request.body);
        const animal = await prisma_1.prisma.animal.create({
            data: {
                ...data,
                userId: request.user.id,
            },
        });
        response.status(201).json(animal);
    }
    async index(request, response) {
        const querySchema = zod_1.z.object({
            species: zod_1.z.string().optional(),
            size: zod_1.z.string().optional(),
            sex: zod_1.z.string().optional(),
            age: zod_1.z.string().optional(), // "0-2", "3-6", "11+"
            page: zod_1.z.coerce.number().optional().default(1),
            perPage: zod_1.z.coerce.number().optional().default(9),
        });
        const { species, size, sex, age, page, perPage } = querySchema.parse(request.query);
        const filters = {};
        if (species)
            filters.species = species;
        if (size)
            filters.size = size;
        if (sex)
            filters.sex = sex;
        // Filtro de idade por faixa
        if (age) {
            const [min, max] = age.split("-");
            if (max === "+") {
                filters.age = { gte: Number(min) };
            }
            else {
                filters.age = {
                    gte: Number(min),
                    lte: Number(max),
                };
            }
        }
        const skip = (page - 1) * perPage;
        const [animals, totalRecords] = await Promise.all([
            prisma_1.prisma.animal.findMany({
                skip,
                take: perPage,
                where: filters,
                orderBy: { createdAt: "desc" },
                include: { user: true },
            }),
            prisma_1.prisma.animal.count({ where: filters }),
        ]);
        const totalPages = Math.ceil(totalRecords / perPage);
        return response.json({
            animals,
            pagination: {
                page,
                perPage,
                totalRecords,
                totalPages: totalPages > 0 ? totalPages : 1,
            },
        });
    }
    async show(request, response) {
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = paramsSchema.parse(request.params);
        const animal = await prisma_1.prisma.animal.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!animal) {
            throw new AppError_1.AppError("Animal não encontrado", 404);
        }
        response.json(animal);
    }
    async update(request, response) {
        if (!request.user?.id) {
            throw new AppError_1.AppError("Não autorizado", 401);
        }
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            species: SpeciesEnum.optional(),
            breed: zod_1.z.string().optional(),
            age: zod_1.z.number().optional(),
            size: zod_1.z.string().optional(),
            sex: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            photo: zod_1.z.string().optional(),
            status: zod_1.z.string().optional(),
        });
        const { id } = paramsSchema.parse(request.params);
        const data = bodySchema.parse(request.body);
        const animal = await prisma_1.prisma.animal.findUnique({ where: { id } });
        if (!animal) {
            throw new AppError_1.AppError("Animal não encontrado", 404);
        }
        if (animal.userId !== request.user.id) {
            throw new AppError_1.AppError("Você não tem permissão para modificar este animal", 403);
        }
        const updated = await prisma_1.prisma.animal.update({
            where: { id },
            data,
        });
        response.json(updated);
    }
    async delete(request, response) {
        if (!request.user?.id) {
            throw new AppError_1.AppError("Não autorizado", 401);
        }
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = paramsSchema.parse(request.params);
        const animal = await prisma_1.prisma.animal.findUnique({ where: { id } });
        if (!animal) {
            throw new AppError_1.AppError("Animal não encontrado", 404);
        }
        if (animal.userId !== request.user.id) {
            throw new AppError_1.AppError("Você não tem permissão para deletar este animal", 403);
        }
        await prisma_1.prisma.animal.delete({ where: { id } });
        response.status(204).send();
    }
}
exports.AnimalsController = AnimalsController;
