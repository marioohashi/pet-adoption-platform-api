import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

const SpeciesEnum = z.enum(["cat", "dog", "other"])

class AnimalsController {
  async me(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Não autorizado", 401)
    }

    const animals = await prisma.animal.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: "desc" },
    })

    return response.json(animals)
  }

  async create(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Não autorizado", 401)
    }

    const bodySchema = z.object({
      name: z.string().min(1, "O nome do pet é obrigatório"),
      species: SpeciesEnum.default("other"),
      breed: z.string().optional(),
      age: z.number().optional(),
      size: z.string().optional(),
      sex: z.string().optional(),
      description: z.string().optional(),
      photos: z.array(z.string()).optional().default([]),
      photo: z.string().optional(),
    })

    const data = bodySchema.parse(request.body)
    const mainPhoto = data.photo || (data.photos.length > 0 ? data.photos[0] : null)

    const animal = await prisma.animal.create({
      data: {
        ...data,
        photo: mainPhoto,
        userId: request.user.id,
      },
    })

    return response.status(201).json(animal)
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      species: z.string().optional(),
      size: z.string().optional(),
      sex: z.string().optional(),
      age: z.string().optional(),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(9),
    });

    const { species, size, sex, age, page, perPage } = querySchema.parse(request.query);
    const filters: any = {};

    if (species) filters.species = species;
    if (size) filters.size = size;
    if (sex) filters.sex = sex;

    if (age) {
      if (age === "puppy") {
        filters.age = { lt: 12 };
      } else if (age === "adult") {
        filters.age = { gte: 12, lte: 84 };
      } else if (age === "senior") {
        filters.age = { gt: 84 };
      } else if (age.endsWith("+")) {
        const minMonths = Number(age.replace("+", ""));
        if (!isNaN(minMonths)) filters.age = { gte: minMonths };
      } else if (age.includes("-")) {
        const [minStr, maxStr] = age.split("-");
        const min = Number(minStr);
        const max = Number(maxStr);
        if (!isNaN(min) && !isNaN(max)) filters.age = { gte: min, lte: max };
      } else {
        const exactMonths = Number(age);
        if (!isNaN(exactMonths)) filters.age = exactMonths;
      }
    }

    const skip = (page - 1) * perPage;

    const [animals, totalRecords] = await Promise.all([
      prisma.animal.findMany({
        skip,
        take: perPage,
        where: filters,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.animal.count({ where: filters }),
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

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.string().uuid("ID inválido") })
    const { id } = paramsSchema.parse(request.params)

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!animal) {
      throw new AppError("Animal não encontrado", 404)
    }

    return response.json(animal)
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
      size: z.string().optional(),
      sex: z.string().optional(),
      description: z.string().optional(),
      photos: z.array(z.string()).optional(),
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

    let mainPhoto = data.photo;
    if (data.photos) {
      mainPhoto = data.photos.length > 0 ? data.photos[0] : "";
    }

    const updated = await prisma.animal.update({
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
    const { id } = paramsSchema.parse(request.params)

    const animal = await prisma.animal.findUnique({ where: { id } })

    if (!animal) {
      throw new AppError("Animal não encontrado", 404)
    }

    if (animal.userId !== request.user.id) {
      throw new AppError("Você não tem permissão para deletar este animal", 403)
    }

    await prisma.animal.delete({ where: { id } })

    return response.status(204).send()
  }
}

export { AnimalsController }