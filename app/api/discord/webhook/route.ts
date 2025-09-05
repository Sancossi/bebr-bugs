import { NextRequest } from 'next/server'
import { BugController } from '../../../../src/controllers/BugController'
import { DiscordBugReport } from '../../../../src/types'

const bugController = new BugController()

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.DISCORD_WEBHOOK_SECRET
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const discordData: DiscordBugReport = await req.json()
    
    const allowedChannels = [
      process.env.DISCORD_QA_AUTOREPORT_CHANNEL_ID,
      process.env.DISCORD_GAME_IDEAS_CHANNEL_ID,
    ].filter(Boolean)
    
    if (!allowedChannels.includes(discordData.channel_id)) {
      return Response.json({ error: 'Channel not allowed' }, { status: 400 })
    }

    if (!discordData.author.bot) {
      return Response.json({ error: 'Only bot messages are processed' }, { status: 400 })
    }

    const response = await bugController.createBugFromDiscord(discordData)
    return response

  } catch (error) {
    console.error('Discord webhook error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 