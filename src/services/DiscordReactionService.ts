import { BugStatus } from '../types'

export class DiscordReactionService {
  /**
   * Определяет статус бага на основе реакций Discord
   */
  static getStatusFromReactions(reactions: Array<{
    emoji: { name: string; id?: string }
    count: number
  }> = []): BugStatus {
    // Проверяем приоритет реакций:
    // 1. ✅ (white_check_mark) - CLOSED
    // 2. ‼️ (bangbang) - REQUIRES_DISCUSSION  
    // 3. ❌ (x) - OUTDATED
    
    const reactionMap = new Map<string, BugStatus>([
      ['✅', BugStatus.CLOSED],
      ['white_check_mark', BugStatus.CLOSED],
      ['‼️', BugStatus.REQUIRES_DISCUSSION],
      ['bangbang', BugStatus.REQUIRES_DISCUSSION],
      ['❌', BugStatus.OUTDATED],
      ['❎', BugStatus.OUTDATED],
      ['x', BugStatus.OUTDATED],
    ])

    // Ищем реакции в порядке приоритета
    const priorityOrder = [
      BugStatus.CLOSED,
      BugStatus.REQUIRES_DISCUSSION, 
      BugStatus.OUTDATED
    ]

    for (const status of priorityOrder) {
      const hasReaction = reactions.some(reaction => {
        const emojiName = reaction.emoji.name?.toLowerCase() || ''
        const mappedStatus = reactionMap.get(emojiName) || reactionMap.get(reaction.emoji.name || '')
        return mappedStatus === status && reaction.count > 0
      })

      if (hasReaction) {
        return status
      }
    }

    // Если нет подходящих реакций, возвращаем NEW
    return BugStatus.NEW
  }

  /**
   * Проверяет, нужно ли обновить статус бага на основе реакций
   */
  static shouldUpdateStatus(currentStatus: BugStatus, reactions: Array<{
    emoji: { name: string; id?: string }
    count: number
  }> = []): boolean {
    const newStatus = this.getStatusFromReactions(reactions)
    
    // Не обновляем статус если он уже в финальном состоянии и не изменился
    const finalStatuses = [BugStatus.CLOSED, BugStatus.OUTDATED]
    if (finalStatuses.includes(currentStatus) && currentStatus === newStatus) {
      return false
    }

    return currentStatus !== newStatus
  }

  /**
   * Получает описание статуса для логирования
   */
  static getStatusDescription(status: BugStatus): string {
    const descriptions = {
      [BugStatus.NEW]: 'Новый',
      [BugStatus.IN_PROGRESS]: 'В работе',
      [BugStatus.TESTING]: 'На тестировании',
      [BugStatus.READY_TO_RELEASE]: 'Готов к релизу',
      [BugStatus.CLOSED]: 'Закрыт',
      [BugStatus.REQUIRES_DISCUSSION]: 'Требует обсуждения',
      [BugStatus.OUTDATED]: 'Неактуальный',
    }

    return descriptions[status] || 'Неизвестный статус'
  }
} 