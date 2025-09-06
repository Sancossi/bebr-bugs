import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../src/lib/auth"
import { BugService } from "../../../../src/services/BugService"

const bugService = new BugService()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Начинаем синхронизацию багов из Discord...")
    
    // Динамический импорт DiscordService для избежания проблем с webpack
    const { DiscordService } = await import("../../../../src/services/DiscordService")
    const discordService = new DiscordService()
    
    try {
      await discordService.login()
      
      const qaChannelId = process.env.DISCORD_QA_AUTOREPORT_CHANNEL_ID
      const gameIdeasChannelId = process.env.DISCORD_GAME_IDEAS_CHANNEL_ID
      
      if (!qaChannelId || !gameIdeasChannelId) {
        throw new Error("ID каналов Discord не настроены в переменных окружения")
      }
      
      const messages = await discordService.getMessagesFromChannels([
        qaChannelId,
        gameIdeasChannelId
      ], 100) 
      
      console.log(`📥 Получено ${messages.length} сообщений из Discord`)
      
      const results = []
      let newBugs = 0
      let existingBugs = 0
      let errors = 0
      
      for (const message of messages) {
        try {
          if (message.embeds.length === 0) {
            continue
          }
          
          const embed = message.embeds[0]
          
          if (!embed.title || !embed.fields?.some(field => field.name === "type")) {
            continue
          }
          
          const existingBug = await bugService.getBugByDiscordMessageId(message.id)
          
          if (existingBug) {
            existingBugs++
            results.push({
              messageId: message.id,
              title: embed.title,
              status: "existing",
              bugId: existingBug.id
            })
            continue
          }
          
          const bug = await bugService.createBugFromDiscord({
            type: 0,
            id: message.id,
            channel_id: message.channelId,
            content: message.content,
            mentions: [],
            mention_roles: [],
            attachments: [],
            embeds: message.embeds,
            timestamp: message.createdAt.toISOString(),
            author: {
              id: message.author.id,
              username: message.author.username,
              bot: message.author.bot
            },
            reactions: (message as any).reactionsData || [], // Добавляем реакции
            thread: message.thread ? {
              id: message.thread.id,
              name: message.thread.name
            } : undefined
          })
          
          if (bug) {
            newBugs++
            results.push({
              messageId: message.id,
              title: bug.title,
              status: "created",
              bugId: bug.id
            })
            console.log("✅ Создан баг:", bug.title)
          } else {
            errors++
            results.push({
              messageId: message.id,
              title: embed.title,
              status: "error",
              error: "Failed to create bug"
            })
          }
        } catch (error) {
          errors++
          console.error("❌ Ошибка при обработке сообщения:", error)
          results.push({
            messageId: message.id,
            title: message.embeds[0]?.title || "Unknown",
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error"
          })
        }
      }
      
      const summary = {
        total: messages.length,
        processed: results.length,
        newBugs,
        existingBugs,
        errors,
        timestamp: new Date().toISOString()
      }
      
      console.log("🎉 Синхронизация завершена:", summary)
      
      return NextResponse.json({
        success: true,
        summary,
        results
      })
      
    } finally {
      await discordService.disconnect()
    }
    
  } catch (error) {
    console.error("💥 Ошибка синхронизации:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
