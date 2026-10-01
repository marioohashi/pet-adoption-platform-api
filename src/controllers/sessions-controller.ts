import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { authConfig } from "@/configs/auth"
import { prisma } from "@/database/prisma"
import { sign, SignOptions } from "jsonwebtoken"
import { compare } from "bcrypt"
import { z } from "zod"

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email({ message: "E-mail inválido" }),
      password: z.string(),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      throw new AppError("E-mail ou senha inválido", 401)
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      throw new AppError("E-mail ou senha inválido", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({ role: user.role }, secret as string, {
      subject: String(user.id),
      expiresIn: expiresIn as SignOptions["expiresIn"],
    })

    const { password: _, ...userWithoutPassword } = user

    response.json({ token, user: userWithoutPassword })
  }

  async google(req: Request, res: Response) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token do Google não fornecido." });
    }

    try {
      const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!googleResponse.ok) {
        return res.status(401).json({ message: "Token do Google inválido ou expirado." });
      }

      const googleData = (await googleResponse.json()) as {
        email?: string;
        name?: string;
        picture?: string;
      };

      const { email, name, picture } = googleData;

      if (!email || !name) {
        return res.status(400).json({ message: "Não foi possível obter os dados da conta Google." });
      }

      let user = await prisma.user.findUnique({ where: { email } });
      let isNewUser = false;

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            password: "",
            avatar: picture ?? ""
          }
        });
        isNewUser = true;
      } else if (!user.avatar && picture) {
        user = await prisma.user.update({
          where: { email },
          data: { avatar: picture }
        });
      }

      const { secret, expiresIn } = authConfig.jwt;

      const appToken = sign({ role: user.role }, secret as string, {
        subject: String(user.id),
        expiresIn: expiresIn as SignOptions["expiresIn"],
      });

      return res.json({
        token: appToken,
        user,
        isNewUser
      });

    } catch (error: any) {
      console.error("ERRO DETALHADO DO GOOGLE AUTH:", error);
      return res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
  }
}

export { SessionsController }