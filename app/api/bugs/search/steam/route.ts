import { NextRequest, NextResponse } from 'next/server'
import { BugService } from '../../../../../src/services/BugService'

const bugService = new BugService()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const steamId = searchParams.get('steamId')
    
    if (!steamId) {
      return NextResponse.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      )
    }

    const bugs = await bugService.searchBugsBySteamId(steamId)
    
    return NextResponse.json({
      success: true,
      bugs,
      total: bugs.length
    })
    
  } catch (error) {
    console.error('Search by Steam ID error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 