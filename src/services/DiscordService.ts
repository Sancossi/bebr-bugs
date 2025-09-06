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

      const messages = await channel.messages.fetch({ limit })
      const messagesArray = Array.from(messages.values())
      
      // Получаем реакции для каждого сообщения
      for (const message of messagesArray) {
        if (message.reactions.cache.size > 0) {
          // Получаем детальную информацию о реакциях
          const reactions = []
          for (const reaction of Array.from(message.reactions.cache.values())) {
            const users = await reaction.users.fetch()
            reactions.push({
              emoji: {
                name: reaction.emoji.name,
                id: reaction.emoji.id
              },
              count: reaction.count,
              users: Array.from(users.values()).map((user: any) => ({
                id: user.id,
                username: user.username
              }))
            })
          }
          // Добавляем реакции к объекту сообщения
          ;(message as any).reactionsData = reactions
        }
      }
      
      return messagesArray
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
