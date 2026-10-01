import { AppError } from "@/utils/AppError"
import { Request, Response } from "express"
import { prisma } from "@/database/prisma"
import { UserRole } from "@prisma/client"
import { hash, compare } from "bcrypt"
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

    return response.status(201).json()
  }

  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany()
    return response.json(users)
  }

  async show(request: Request, response: Response) {
    const userId = request.user?.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404)
    }

    const { password: _, ...userWithoutPassword } = user

    return response.json({ user: userWithoutPassword })
  }

  async updateProfile(request: Request, response: Response) {
    const userId = request.user?.id // ID seguro vindo do token JWT autenticado

    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      phone: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().max(2).optional().nullable(), // 👈 Adicionado suporte à UF
      bio: z.string().optional().nullable(),
      avatar: z.string().optional().nullable(), // 👈 Adicionado suporte ao avatar do Cloudinary
    })

    const data = bodySchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    if (data.email && data.email !== user.email) {
      const userWithSameEmail = await prisma.user.findFirst({ where: { email: data.email } })
      if (userWithSameEmail) {
        throw new AppError("Este e-mail já está em uso por outro usuário.")
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone !== undefined ? data.phone : user.phone,
        city: data.city !== undefined ? data.city : user.city,
        state: data.state !== undefined ? data.state : user.state, // 👈 Atualizando estado
        bio: data.bio !== undefined ? data.bio : user.bio,
        avatar: data.avatar !== undefined ? data.avatar : user.avatar, // 👈 Atualizando avatar
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return response.json(userWithoutPassword) // Retorna direto o objeto limpo para o updateSession(response.data) funcionar
  }

  async updatePassword(request: Request, response: Response) {
    const userId = request.user?.id

    const bodySchema = z.object({
      oldPassword: z.string().min(6),
      newPassword: z.string().min(6),
    })

    const { oldPassword, newPassword } = bodySchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const checkOldPassword = await compare(oldPassword, user.password)
    if (!checkOldPassword) {
      throw new AppError("A senha atual está incorreta.")
    }

    const hashedNewPassword = await hash(newPassword, 8)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    return response.json({ message: "Senha alterada com sucesso." })
  }

  async delete(request: Request, response: Response) {
    const currentUserId = request.user?.id;
    const currentUserRole = request.user?.role;

    // Força o parâmetro da rota a ser tratado estritamente como string (ou undefined)
    const targetUserId = request.params.id as string | undefined;

    if (targetUserId && targetUserId !== currentUserId) {
      if (currentUserRole !== "admin") {
        throw new AppError("Ação não autorizada.", 403);
      }
    }

    const userIdToDelete = targetUserId || currentUserId;

    const user = await prisma.user.findUnique({ where: { id: userIdToDelete } });
    if (!user) {
      throw new AppError("Utilizador não encontrado", 404);
    }

    await prisma.user.delete({ where: { id: userIdToDelete } });

    return response.status(204).send();
  }
}

export { UsersController }