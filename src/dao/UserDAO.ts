import { prisma } from '../lib/database'
import { User } from '@prisma/client'

export class UserDAO {
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { discordId },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  }

  async create(data: {
    name?: string
    email?: string
    image?: string
    discordId?: string
  }): Promise<User> {
    return await prisma.user.create({
      data,
    })
  }

  async update(id: string, data: {
    name?: string
    email?: string
    image?: string
    discordId?: string
  }): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }
} 