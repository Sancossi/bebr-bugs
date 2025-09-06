import { Client, GatewayIntentBits } from "discord.js"

export class DiscordService {
  private client: Client
  private isReady = false

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // ВАЖНО: MessageContent - привилегированный intent!
        // Его нужно включить в Discord Developer Portal -> Bot -> Privileged Gateway Intents
        GatewayIntentBits.MessageContent,
      ],
    })

    this.client.once("ready", () => {
      console.log("Discord bot готов!")
      this.isReady = true
    })

    this.client.on("error", (error) => {
      console.error("Discord bot ошибка:", error)
    })
  }

  async login() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      throw new Error("DISCORD_BOT_TOKEN не задан в переменных окружения")
    }
    
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN)
      
      // Ждем пока бот подключится
      while (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      if (error.message.includes('disallowed intents')) {
        throw new Error(
          "Ошибка: Привилегированные intents не включены!\n" +
          "Перейдите в Discord Developer Portal -> Bot -> Privileged Gateway Intents\n" +
          "и включите 'MESSAGE CONTENT INTENT'"
        )
      }
      throw error
    }
  }

  async getMessagesFromChannel(channelId: string, limit = 50) {
    if (!this.isReady) {
      throw new Error("Discord bot не готов")
    }

    try {
      const channel = await this.client.channels.fetch(channelId)
      
      if (!channel || !channel.isTextBased()) {
        throw new Error(`Канал ${channelId} не найден или не является текстовым`)
      }

      const allMessages: any[] = []
      let lastMessageId: string | undefined = undefined
      const maxPerRequest = 100 // Discord API лимит
      
      // Получаем сообщения порциями по 100
      while (allMessages.length < limit) {
        const remainingLimit = Math.min(maxPerRequest, limit - allMessages.length)
        
        const fetchOptions: any = { limit: remainingLimit }
        if (lastMessageId) {
          fetchOptions.before = lastMessageId
        }
        
        const messages = await channel.messages.fetch(fetchOptions)
        const messagesArray: any[] = []
        
        // Преобразуем Collection в массив с приведением типов
        ;(messages as any).forEach((message: any) => {
          messagesArray.push(message)
        })
        
        if (messagesArray.length === 0) {
          break // Больше сообщений нет
        }
        
        allMessages.push(...messagesArray)
        const lastMessage = messagesArray[messagesArray.length - 1]
        lastMessageId = lastMessage?.id
        
        // Если получили меньше чем запрашивали, значит это все сообщения
        if (messagesArray.length < remainingLimit) {
          break
        }
      }
      
      console.log(`📥 Получено ${allMessages.length} сообщений из канала ${channelId}`)
      
      // Получаем базовую информацию о реакциях (без пользователей для упрощения)
      for (const message of allMessages) {
        if (message.reactions && message.reactions.cache && message.reactions.cache.size > 0) {
          const reactions: any[] = []
          
          try {
            ;(message.reactions.cache as any).forEach((reaction: any) => {
              if (reaction.emoji) {
                reactions.push({
                  emoji: {
                    name: reaction.emoji.name || '',
                    id: reaction.emoji.id || null
                  },
                  count: reaction.count || 0
                })
              }
            })
            
            // Добавляем реакции к объекту сообщения
            ;(message as any).reactionsData = reactions
          } catch (reactionError) {
            console.warn(`Ошибка получения реакций для сообщения ${message.id}:`, reactionError)
          }
        }
      }
      
      return allMessages
    } catch (error) {
      console.error(`Ошибка получения сообщений из канала ${channelId}:`, error)
      throw error
    }
  }

  async getMessagesFromChannels(channelIds: string[], limit = 50) {
    const allMessages = []
    
    for (const channelId of channelIds) {
      try {
        const messages = await this.getMessagesFromChannel(channelId, limit)
        allMessages.push(...messages)
      } catch (error) {
        console.error(`Ошибка получения сообщений из канала ${channelId}:`, error)
        // Не прерываем выполнение, продолжаем с другими каналами
      }
    }
    
    return allMessages
  }

  async disconnect() {
    await this.client.destroy()
  }
}
