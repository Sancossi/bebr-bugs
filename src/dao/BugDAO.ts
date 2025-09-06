import { prisma } from '../lib/database'
import { Bug, Prisma } from '@prisma/client'
import { BugWithRelations, CreateBugRequest, UpdateBugRequest, BugStatus, BugType, BugPriority } from '../types'

export class BugDAO {
  async create(data: CreateBugRequest & {
    reportedById?: string
    discordMessageId?: string
    discordChannelId?: string
    discordThreadId?: string
    level?: string
    playerPosition?: string
    cameraPosition?: string
    cameraRotation?: string
    fps?: number
    gpu?: string
    cpu?: string
    os?: string
    ramTotal?: string
    currentRam?: string
    vram?: string
    currentVram?: string
    customData?: string
    screenshotUrl?: string
    attachmentUrls?: string
  }): Promise<Bug> {
    return await prisma.bug.create({
      data,
    })
  }

  async findById(id: string): Promise<BugWithRelations | null> {
    return await prisma.bug.findUnique({
      where: { id },
      include: {
        reportedBy: true,
        assignedTo: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
  }

  async findByDiscordMessageId(discordMessageId: string): Promise<Bug | null> {
    return await prisma.bug.findUnique({
      where: { discordMessageId },
    })
  }

  async findAll(params: {
    status?: BugStatus
    type?: BugType
    assignedToId?: string
    reportedById?: string
    skip?: number
    take?: number
  } = {}): Promise<BugWithRelations[]> {
    const { status, type, assignedToId, reportedById, skip = 0, take = 150 } = params

    const where: Prisma.BugWhereInput = {}
    if (status) where.status = status
    if (type) where.type = type
    if (assignedToId) where.assignedToId = assignedToId
    if (reportedById) where.reportedById = reportedById

    return await prisma.bug.findMany({
      where,
      include: {
        reportedBy: true,
        assignedTo: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    })
  }

  async update(id: string, data: UpdateBugRequest): Promise<Bug> {
    return await prisma.bug.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async updateStatus(id: string, status: BugStatus): Promise<Bug> {
    return await prisma.bug.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: string): Promise<Bug> {
    return await prisma.bug.delete({
      where: { id },
    })
  }

  async count(params: {
    status?: BugStatus
    type?: BugType
    assignedToId?: string
    reportedById?: string
  } = {}): Promise<number> {
    const { status, type, assignedToId, reportedById } = params

    const where: Prisma.BugWhereInput = {}
    if (status) where.status = status
    if (type) where.type = type
    if (assignedToId) where.assignedToId = assignedToId
    if (reportedById) where.reportedById = reportedById

    return await prisma.bug.count({ where })
  }

  async getStatusCounts(): Promise<Record<BugStatus, number>> {
    const counts = await prisma.bug.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const result: Record<BugStatus, number> = {
      NEW: 0,
      IN_PROGRESS: 0,
      TESTING: 0,
      READY_TO_RELEASE: 0,
      CLOSED: 0,
    }

    counts.forEach(({ status, _count }) => {
      result[status] = _count.status
    })

    return result
  }
} 