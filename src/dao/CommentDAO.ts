import { prisma } from '../lib/database'
import { Comment } from '@prisma/client'
import { CommentWithAuthor, CreateCommentRequest } from '../types'

export class CommentDAO {
  async create(bugId: string, authorId: string, data: CreateCommentRequest): Promise<Comment> {
    return await prisma.comment.create({
      data: {
        ...data,
        bugId,
        authorId,
      },
    })
  }

  async findById(id: string): Promise<CommentWithAuthor | null> {
    return await prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
      },
    })
  }

  async findByBugId(bugId: string): Promise<CommentWithAuthor[]> {
    return await prisma.comment.findMany({
      where: { bugId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  async update(id: string, content: string): Promise<Comment> {
    return await prisma.comment.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: string): Promise<Comment> {
    return await prisma.comment.delete({
      where: { id },
    })
  }
} 