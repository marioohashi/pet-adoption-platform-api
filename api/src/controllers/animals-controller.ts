import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

const SpeciesEnum = z.enum(["cat", "dog", "other"])

class AnimalsController {
  async create(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Não autorizado", 401)
    }

    const bodySchema = z.object({
      name: z.string().min(1),
      species: SpeciesEnum.default("other"),
      breed: z.string().optional(),
      age: z.number().optional(),
      size: z.string().optional(),
      sex: z.string().optional(),
      description: z.string().optional(),
      photo: z.string().optional(),
    })

    const data = bodySchema.parse(request.body)

    const animal = await prisma.animal.create({
      data: {
        ...data,
        userId: request.user.id,
      },
    })

    response.status(201).json(animal)
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      name: z.string().optional().default(""),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })

    const { name, page, perPage } = querySchema.parse(request.query)
    const skip = (page - 1) * perPage

    const animals = await prisma.animal.findMany({
      skip,
      take: perPage,
      where: {
        name: {
          contains: name.trim(),
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    })

    const totalRecords = await prisma.animal.count()
    const totalPages = Math.ceil(totalRecords / perPage)

    response.json({
      animals,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      },
    })
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!animal) {
      throw new AppError("Animal não encontrado", 404)
    }

    response.json(animal)
  }

  async update(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Não autorizado", 401)
    }

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      name: z.string().optional(),
      species: SpeciesEnum.optional(),
      breed: z.string().optional(),
      age: z.number().optional(),
      size: z.string().optional(),
      sex: z.string().optional(),
      description: z.string().optional(),
      photo: z.string().optional(),
      status: z.string().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const animal = await prisma.animal.findUnique({ where: { id } })

    if (!animal) {
      throw new AppError("Animal não encontrado", 404)
    }

    if (animal.userId !== request.user.id) {
      throw new AppError("Você não tem permissão para modificar este animal", 403)
    }

    const updated = await prisma.animal.update({
      where: { id },
      data,
    })

    response.json(updated)
  }

  async delete(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Não autorizado", 401)
    }

    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const animal = await prisma.animal.findUnique({ where: { id } })

    if (!animal) {
      throw new AppError("Animal não encontrado", 404)
    }

    if (animal.userId !== request.user.id) {
      throw new AppError("Você não tem permissão para deletar este animal", 403)
    }

    await prisma.animal.delete({ where: { id } })

    response.status(204).send()
  }
}

export { AnimalsController }