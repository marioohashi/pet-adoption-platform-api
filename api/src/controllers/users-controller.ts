import { AppError } from "@/utils/AppError"
import { Request, Response } from "express"
import { prisma } from "@/database/prisma"
import { UserRole } from "@prisma/client"
import { hash } from "bcrypt"
import { z } from "zod"

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2, { message: "Nome é obrigatório" }),
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(6),
      role: z.enum([UserRole.user, UserRole.admin]).default(UserRole.user),
    })

    const { name, email, password, role } = bodySchema.parse(request.body)

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } })

    if (userWithSameEmail) {
      throw new AppError("Já existe um usuário cadastrado com esse e-mail")
    }

    const hashedPassword = await hash(password, 8)

    await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    })

    response.status(201).json()
  }

  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany()
    response.json(users)
  }

  async show(request: Request, response: Response) {
    const { id } = request.params

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    response.json(user)
  }
}

export { UsersController }
