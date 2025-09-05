import { BugDAO } from '../dao/BugDAO'
import { CommentDAO } from '../dao/CommentDAO'
import { UserDAO } from '../dao/UserDAO'
import { BugWithRelations, CreateBugRequest, UpdateBugRequest, CreateCommentRequest, DiscordBugReport } from '../types'
import { BugStatus, BugType, BugPriority } from '../types'

export class BugService {
  private bugDAO: BugDAO
  private commentDAO: CommentDAO
  private userDAO: UserDAO

  constructor() {
    this.bugDAO = new BugDAO()
    this.commentDAO = new CommentDAO()
    this.userDAO = new UserDAO()
  }

  async createBug(data: CreateBugRequest, reportedById?: string): Promise<BugWithRelations> {
    const bug = await this.bugDAO.create({
      ...data,
      reportedById,
    })

    return await this.getBugById(bug.id) as BugWithRelations
  }

  async createBugFromDiscord(discordData: DiscordBugReport): Promise<BugWithRelations | null> {
    // Проверяем, не существует ли уже баг с таким Discord message ID
    const existingBug = await this.bugDAO.findByDiscordMessageId(discordData.id)
    if (existingBug) {
      return await this.getBugById(existingBug.id) as BugWithRelations
    }

    const embed = discordData.embeds[0]
    if (!embed) return null

    // Парсим данные из Discord embed
    const fields = embed.fields || []
    const getFieldValue = (name: string) => fields.find(f => f.name === name)?.value

    const type = this.parseDiscordBugType(getFieldValue('type') || 'Other')
    const title = embed.title || 'Untitled Bug'
    const description = embed.description || ''

    // Парсим техническую информацию
    const level = getFieldValue('level')
    const playerPosition = getFieldValue('player_position')
    const cameraPosition = getFieldValue('camera_position')
    const cameraRotation = getFieldValue('camera_rotation')
    const fps = parseFloat(getFieldValue('fps') || '0') || undefined
    const gpu = getFieldValue('gpu')
    const cpu = getFieldValue('cpu')
    const os = getFieldValue('os')
    const ramTotal = getFieldValue('ram_total')
    const currentRam = getFieldValue('current_ram')
    const vram = getFieldValue('vram')
    const currentVram = getFieldValue('current_vram')
    const customData = getFieldValue('custom_data')

    // Извлекаем URL скриншота
    const screenshotUrl = embed.image?.url

    const bug = await this.bugDAO.create({
      title,
      description,
      type,
      priority: BugPriority.MEDIUM,
      discordMessageId: discordData.id,
      discordChannelId: discordData.channel_id,
      discordThreadId: discordData.thread?.id,
      level,
      playerPosition,
      cameraPosition,
      cameraRotation,
      fps,
      gpu,
      cpu,
      os,
      ramTotal,
      currentRam,
      vram,
      currentVram,
      customData,
      screenshotUrl,
    })

    return await this.getBugById(bug.id) as BugWithRelations
  }

  async getBugById(id: string): Promise<BugWithRelations | null> {
    return await this.bugDAO.findById(id)
  }

  async getBugByDiscordMessageId(discordMessageId: string): Promise<any> {
    return await this.bugDAO.findByDiscordMessageId(discordMessageId)
  }

  async getAllBugs(params: {
    status?: BugStatus
    type?: BugType
    assignedToId?: string
    reportedById?: string
    page?: number
    limit?: number
  } = {}): Promise<{ bugs: BugWithRelations[], total: number, totalPages: number }> {
    const { page = 1, limit = 20, ...filters } = params
    const skip = (page - 1) * limit

    const [bugs, total] = await Promise.all([
      this.bugDAO.findAll({ ...filters, skip, take: limit }),
      this.bugDAO.count(filters),
    ])

    return {
      bugs,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  async updateBug(id: string, data: UpdateBugRequest): Promise<BugWithRelations> {
    await this.bugDAO.update(id, data)
    return await this.getBugById(id) as BugWithRelations
  }

  async updateBugStatus(id: string, status: BugStatus): Promise<BugWithRelations> {
    await this.bugDAO.updateStatus(id, status)
    return await this.getBugById(id) as BugWithRelations
  }

  async deleteBug(id: string): Promise<void> {
    await this.bugDAO.delete(id)
  }

  async addComment(bugId: string, authorId: string, data: CreateCommentRequest): Promise<BugWithRelations> {
    await this.commentDAO.create(bugId, authorId, data)
    return await this.getBugById(bugId) as BugWithRelations
  }

  async getKanbanData(): Promise<Record<BugStatus, BugWithRelations[]>> {
    const statusCounts = await this.bugDAO.getStatusCounts()
    
    const kanbanData: Record<BugStatus, BugWithRelations[]> = {
      NEW: [],
      IN_PROGRESS: [],
      TESTING: [],
      READY_TO_RELEASE: [],
      CLOSED: [],
    }

    // Загружаем баги для каждого статуса
    for (const status of Object.keys(kanbanData) as BugStatus[]) {
      kanbanData[status] = await this.bugDAO.findAll({ status, take: 50 })
    }

    return kanbanData
  }

  async getStatistics(): Promise<{
    total: number
    byStatus: Record<BugStatus, number>
    byType: Record<BugType, number>
  }> {
    const [total, byStatus] = await Promise.all([
      this.bugDAO.count(),
      this.bugDAO.getStatusCounts(),
    ])

    // Получаем статистику по типам (упрощенная версия)
    const byType: Record<BugType, number> = {
      Gameplay: 0,
      GameIdeas: 0,
      UI: 0,
      Performance: 0,
      Audio: 0,
      Graphics: 0,
      Network: 0,
      Other: 0,
    }

    return { total, byStatus, byType }
  }

  private parseDiscordBugType(discordType: string): BugType {
    switch (discordType.toLowerCase()) {
      case 'gameplay':
        return BugType.Gameplay
      case 'gameideas':
        return BugType.GameIdeas
      case 'ui':
        return BugType.UI
      case 'performance':
        return BugType.Performance
      case 'audio':
        return BugType.Audio
      case 'graphics':
        return BugType.Graphics
      case 'network':
        return BugType.Network
      default:
        return BugType.Other
    }
  }
} 