import { BugDAO } from '../dao/BugDAO'
import { CommentDAO } from '../dao/CommentDAO'
import { UserDAO } from '../dao/UserDAO'
import { BugWithRelations, CreateBugRequest, UpdateBugRequest, CreateCommentRequest, DiscordBugReport } from '../types'
import { BugStatus, BugType, BugPriority } from '../types'
import { DiscordReactionService } from './DiscordReactionService'

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
      createdAt: new Date(), // Устанавливаем текущую дату для обычных багов
    })

    return await this.getBugById(bug.id) as BugWithRelations
  }

  async createBugFromDiscord(discordData: DiscordBugReport): Promise<BugWithRelations | null> {
    // Проверяем, не существует ли уже баг с таким Discord message ID
    const existingBug = await this.bugDAO.findByDiscordMessageId(discordData.id)
    if (existingBug) {
      // Пытаемся обновить существующий баг с steamId, если его нет
      const updatedBug = await this.updateExistingBugWithSteamId(existingBug, discordData)
      if (updatedBug) {
        return updatedBug as BugWithRelations
      }
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

    // Парсим Steam ID
    const steamId = this.parseSteamIdFromDiscord(discordData)

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

    // Определяем статус на основе реакций Discord
    const status = DiscordReactionService.getStatusFromReactions(discordData.reactions || [])
    
    // Парсим дату создания сообщения
    const createdAt = new Date(discordData.timestamp)

    // Извлекаем URL скриншота
    const screenshotUrl = embed.image?.url
    
    const bug = await this.bugDAO.create({
      title,
      description,
      type,
      status, // Используем статус из реакций вместо дефолтного NEW
      priority: BugPriority.MEDIUM,
      steamId, // Добавляем Steam ID
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
      createdAt, // Используем дату из Discord сообщения
    })

    if (steamId) {
      console.log(`✅ Создан новый баг "${title}" с Steam ID: ${steamId}`)
    } else {
      console.log(`⚠️ Создан новый баг "${title}" без Steam ID`)
    }

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
    search?: string
    steamId?: string
    level?: string
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
      REQUIRES_DISCUSSION: [],
      OUTDATED: [],
    }

    // Загружаем баги для каждого статуса
    for (const status of Object.keys(kanbanData) as BugStatus[]) {
      kanbanData[status] = await this.bugDAO.findAll({ status, take: 150 })
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
      Bug: 0,
      Feature: 0,
      Improvement: 0,
      Task: 0,
      Other: 0,
    }

    return { total, byStatus, byType }
  }

  private parseDiscordBugType(discordType: string): BugType {
    switch (discordType.toLowerCase()) {
      case 'gameplay':
      case 'bug':
        return BugType.Bug
      case 'gameideas':
      case 'feature':
        return BugType.Feature
      case 'ui':
      case 'improvement':
        return BugType.Improvement
      case 'performance':
      case 'task':
        return BugType.Task
      case 'audio':
      case 'graphics':
      case 'network':
      default:
        return BugType.Other
    }
  }

  /**
   * Парсит Steam ID из Discord embed полей
   */
  private parseSteamIdFromDiscord(discordData: DiscordBugReport): string | null {
    const embed = discordData.embeds[0]
    if (!embed) {
      console.log('🔍 Steam ID Parser: Нет embed данных')
      return null
    }

    console.log('🔍 Steam ID Parser: Начинаем поиск Steam ID...')
    console.log('🔍 Embed title:', embed.title)
    console.log('🔍 Embed description:', embed.description?.substring(0, 200) + '...')
    console.log('�� Discord content:', discordData.content?.substring(0, 200) + '...')

    const fields = embed.fields || []
    const getFieldValue = (name: string) => fields.find(f => f.name === name)?.value

    // Функция для поиска Steam ID в тексте
    const extractSteamIdFromText = (text: string): string | null => {
      if (!text) return null
      
      // Ищем паттерны типа "Owner: 76561198258455447" или просто "76561198258455447"
      const steamIdPatterns = [
        /Owner:\s*(\d{17})/i,
        /Steam\s*ID:\s*(\d{17})/i,
        /SteamID:\s*(\d{17})/i,
        /Player:\s*(\d{17})/i,
        /User:\s*(\d{17})/i,
        /"Owner:\s*(\d{17})"/i, // JSON формат
        /"(\d{17})":\s*"SteamName:/i, // Формат "76561198258455447": "SteamName:
        /(\d{17})/g // Любое 17-значное число (стандартный Steam ID64)
      ]

      for (const pattern of steamIdPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          const steamId = match[1].trim()
          // Проверяем, что это действительно похоже на Steam ID (17 цифр, начинается с 765)
          if (steamId.length === 17 && steamId.startsWith('765')) {
            console.log(`🎯 Steam ID найден по паттерну ${pattern}: ${steamId}`)
            return steamId
          }
        }
      }
      return null
    }

    // Ищем Steam ID в различных возможных полях
    const steamIdFields = [
      'steam_id',
      'steamid', 
      'steam',
      'player_id',
      'user_id',
      'userid',
      'owner'
    ]

    console.log('🔍 Доступные поля embed:', fields.map(f => f.name))

    for (const fieldName of steamIdFields) {
      const fieldValue = getFieldValue(fieldName)
      if (fieldValue && fieldValue.trim()) {
        console.log(`🔍 Проверяем поле "${fieldName}":`, fieldValue.substring(0, 100) + '...')
        
        // Сначала пробуем извлечь Steam ID из текста
        const steamId = extractSteamIdFromText(fieldValue)
        if (steamId) return steamId
        
        // Если не найден, очищаем значение от лишних символов
        const cleanedValue = fieldValue.trim().replace(/[<>@]/g, '')
        if (cleanedValue.length > 0) {
          console.log(`🔍 Очищенное значение поля "${fieldName}":`, cleanedValue)
          return cleanedValue
        }
      }
    }

    // Дополнительно проверяем описание embed на наличие Steam ID
    if (embed.description) {
      console.log('🔍 Проверяем описание embed...')
      const steamId = extractSteamIdFromText(embed.description)
      if (steamId) return steamId
    }

    // Проверяем поля на наличие JSON данных с Steam ID
    for (const field of fields) {
      if (field.value) {
        console.log(`🔍 Проверяем поле "${field.name}" на наличие Steam ID...`)
        const steamId = extractSteamIdFromText(field.value)
        if (steamId) return steamId
      }
    }

    // Проверяем основной контент Discord сообщения
    if (discordData.content) {
      console.log('🔍 Проверяем основной контент Discord сообщения...')
      const steamId = extractSteamIdFromText(discordData.content)
      if (steamId) return steamId
    }

    console.log('❌ Steam ID не найден в сообщении')
    return null
  }

  /**
   * Обновляет существующий баг из Discord, если у него не было steamId
   */
  private async updateExistingBugWithSteamId(existingBug: any, discordData: DiscordBugReport): Promise<any | null> {
    const embed = discordData.embeds[0]
    if (!embed) return null

    let hasUpdates = false
    const updates: any = {}

    // Проверяем и обновляем steamId, если его нет
    if (!existingBug.steamId) {
      const steamId = this.parseSteamIdFromDiscord(discordData)
      if (steamId) {
        updates.steamId = steamId
        hasUpdates = true
        console.log(`✅ Найден Steam ID для бага "${existingBug.title}": ${steamId}`)
      }
    }

    // Всегда обновляем ссылку на изображение, если она есть в Discord
    const newScreenshotUrl = embed.image?.url
    if (newScreenshotUrl && newScreenshotUrl !== existingBug.screenshotUrl) {
      updates.screenshotUrl = newScreenshotUrl
      hasUpdates = true
      console.log(`🖼️ Обновлена ссылка на изображение для бага "${existingBug.title}"`)
      console.log(`   Старая: ${existingBug.screenshotUrl || 'отсутствует'}`)
      console.log(`   Новая: ${newScreenshotUrl}`)
    }

    // Если есть обновления, сохраняем их
    if (hasUpdates) {
      await this.bugDAO.update(existingBug.id, updates)
      console.log(`✅ Обновлен баг "${existingBug.title}" с новыми данными`)
      
      // Возвращаем обновленный баг
      return await this.getBugById(existingBug.id)
    }

    // Если обновлений нет, возвращаем null
    return null
  }

  /**
   * Поиск багов по Steam ID
   */
  async searchBugsBySteamId(steamId: string): Promise<BugWithRelations[]> {
    // Пока используем общий поиск, позже добавим специальный метод
    return await this.bugDAO.findAll({ 
      steamId: steamId,
      take: 100 
    })
  }
} 