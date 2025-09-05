import { Client, GatewayIntentBits } from "discord.js"

export class DiscordService {
  private client: Client
  private isReady = false

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    })

    this.client.once("ready", () => {
      console.log("Discord bot �����!")
      this.isReady = true
    })

    this.client.on("error", (error) => {
      console.error("Discord bot ������:", error)
    })
  }

  async login() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      throw new Error("DISCORD_BOT_TOKEN �� ������ � ���������� ���������")
    }
    
    await this.client.login(process.env.DISCORD_BOT_TOKEN)
    
    // ���� ���� ��� �����������
    while (!this.isReady) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async getMessagesFromChannel(channelId: string, limit = 50) {
    if (!this.isReady) {
      throw new Error("Discord bot �� �����")
    }

    const channel = await this.client.channels.fetch(channelId)
    
    if (!channel || !channel.isTextBased()) {
      throw new Error(`����� ${channelId} �� ������ ��� �� �������� ���������`)
    }

    const messages = await channel.messages.fetch({ limit })
    return Array.from(messages.values())
  }

  async getMessagesFromChannels(channelIds: string[], limit = 50) {
    const allMessages = []
    
    for (const channelId of channelIds) {
      try {
        const messages = await this.getMessagesFromChannel(channelId, limit)
        allMessages.push(...messages)
      } catch (error) {
        console.error(`������ ��������� ��������� �� ������ ${channelId}:`, error)
      }
    }
    
    return allMessages
  }

  async disconnect() {
    await this.client.destroy()
  }
}
