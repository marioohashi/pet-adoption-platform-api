import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

// --- ZOD ENUMS ---
const SpeciesEnum = z.enum(["dog", "cat", "other"])
const SizeEnum = z.enum(["small", "medium", "large"]) // Ajustado "big" para "large" conforme o frontend
const GenderEnum = z.enum(["male", "female"])
const PetTypeEnum = z.enum(["adoption", "lost", "found"])
const PetStatusEnum = z.enum(["active", "resolved", "adopted"])

class PetsController {
    async index(request: Request, response: Response) {
        const querySchema = z.object({
            type: z.string().optional(),
            species: z.string().optional(),
            size: z.string().optional(),
            gender: z.string().optional(),
            city: z.string().optional(),
            search: z.string().optional(),
            page: z.coerce.number().optional().default(1),
            perPage: z.coerce.number().optional().default(9),
        })

        const { type, species, size, gender, city, search, page, perPage } = querySchema.parse(request.query)

        const filters: any = {}

        // Filtros básicos
        if (type) filters.type = type
        if (species) filters.species = species
        if (size) filters.size = size
        if (gender) filters.gender = gender
        if (city) filters.city = { contains: city, mode: "insensitive" }

        // Busca textual (Nome, Raça ou Cidade)
        if (search) {
            filters.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { breed: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
            ]
        }

        const skip = (page - 1) * perPage

        const [pets, totalRecords] = await Promise.all([
            prisma.pet.findMany({
                skip,
                take: perPage,
                where: filters,
                orderBy: { createdAt: "desc" },
                include: { user: true },
            }),
            prisma.pet.count({ where: filters }),
        ])

        const totalPages = Math.ceil(totalRecords / perPage)

        return response.json({
            pets,
            pagination: {
                page,
                perPage,
                totalRecords,
                totalPages: totalPages > 0 ? totalPages : 1,
            },
        })
    }

    async me(request: Request, response: Response) {
        if (!request.user?.id) {
            throw new AppError("Não autorizado", 401)
        }

        const pets = await prisma.pet.findMany({
            where: { userId: request.user.id },
            orderBy: { createdAt: "desc" },
        })

        return response.json(pets)
    }

    async create(request: Request, response: Response) {
        if (!request.user?.id) {
            throw new AppError("Não autorizado", 401)
        }

        const bodySchema = z.object({
            name: z.string().min(1, "O nome do pet é obrigatório"),
            species: SpeciesEnum.default("dog"),
            breed: z.string().optional(),
            age: z.number().optional(),
            gender: GenderEnum.optional(),
            size: SizeEnum.optional(),
            type: PetTypeEnum.default("adoption"),
            city: z.string().min(1, "A cidade é obrigatória"),
            state: z.string().length(2, "Use a sigla do estado com 2 letras (ex: PR)"),
            contactName: z.string().min(1, "O nome de contato é obrigatório"),
            phone: z.string().min(1, "O telefone é obrigatório"),
            description: z.string().optional(),
            photos: z.array(z.string()).optional().default([]),
            photo: z.string().optional(),
        })

        const data = bodySchema.parse(request.body)

        // Define a foto principal usando a lógica de prioridade (photo avulsa ou primeiro item do array)
        const mainPhoto = data.photo || (data.photos.length > 0 ? data.photos[0] : null)

        const pet = await prisma.pet.create({
            data: {
                name: data.name,
                species: data.species as any,
                breed: data.breed,
                age: data.age,
                gender: data.gender as any,
                size: data.size as any,
                type: data.type as any,
                city: data.city,
                state: data.state,
                contactName: data.contactName,
                phone: data.phone,
                description: data.description,
                photos: data.photos,
                userId: request.user.id,
            },
        })

        return response.status(201).json(pet)
    }

    async show(request: Request, response: Response) {
        const paramsSchema = z.object({ id: z.string().uuid("ID inválido") })
        const { id } = paramsSchema.parse(request.params)

        const pet = await prisma.pet.findUnique({
            where: { id },
            include: { user: true },
        })

        if (!pet) {
            throw new AppError("Pet não encontrado", 404)
        }

        return response.json(pet)
    }

    async update(request: Request, response: Response) {
        if (!request.user?.id) {
            throw new AppError("Não autorizado", 401)
        }

        const paramsSchema = z.object({ id: z.string().uuid("ID inválido") })
        const bodySchema = z.object({
            name: z.string().optional(),
            species: SpeciesEnum.optional(),
            breed: z.string().optional(),
            age: z.number().optional(),
            gender: GenderEnum.optional(),
            size: SizeEnum.optional(),
            type: PetTypeEnum.optional(),
            status: PetStatusEnum.optional(),
            city: z.string().optional(),
            state: z.string().length(2).optional(),
            contactName: z.string().optional(),
            phone: z.string().optional(),
            description: z.string().optional(),
            photos: z.array(z.string()).optional(),
            photo: z.string().optional(),
        })

        const { id } = paramsSchema.parse(request.params)
        const data = bodySchema.parse(request.body)

        const pet = await prisma.pet.findUnique({ where: { id } })

        if (!pet) {
            throw new AppError("Pet não encontrado", 404)
        }

        if (pet.userId !== request.user.id) {
            throw new AppError("Você não tem permissão para modificar este pet", 403)
        }

        let mainPhoto = data.photo;
        if (data.photos) {
            mainPhoto = data.photos.length > 0 ? data.photos[0] : "";
        }

        const updated = await prisma.pet.update({
            where: { id },
            data: {
                ...data,
                ...(mainPhoto !== undefined && { photo: mainPhoto }),
            },
        })

        return response.json(updated)
    }

    async delete(request: Request, response: Response) {
        if (!request.user?.id) {
            throw new AppError("Não autorizado", 401)
        }

        const paramsSchema = z.object({ id: z.string().uuid("ID inválido") })
        $({ id } = paramsSchema.parse(request.params)) // Mantendo compatível com a estrutura original

        const pet = await prisma.pet.findUnique({ where: { id } })

        if (!pet) {
            throw new AppError("Pet não encontrado", 404)
        }

        if (pet.userId !== request.user.id) {
            throw new AppError("Você não tem permissão para deletar este pet", 403)
        }

        await prisma.pet.delete({ where: { id } })

        return response.status(204).send()
    }
}

export { PetsController }