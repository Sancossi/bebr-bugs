import { NextRequest, NextResponse } from 'next/server'
import { BugService } from '../services/BugService'
import { CreateBugRequest, UpdateBugRequest, DiscordBugReport } from '../types'
import { BugStatus, BugType } from '../types'

export class BugController {
  private bugService: BugService

  constructor() {
    this.bugService = new BugService()
  }

  async createBug(req: NextRequest, userId?: string): Promise<NextResponse> {
    try {
      const body: CreateBugRequest = await req.json()
      const bug = await this.bugService.createBug(body, userId)
      
      return NextResponse.json({ success: true, data: bug }, { status: 201 })
    } catch (error) {
      console.error('Error creating bug:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create bug' },
        { status: 500 }
      )
    }
  }

  async createBugFromDiscord(discordData: DiscordBugReport): Promise<NextResponse> {
    try {
      const bug = await this.bugService.createBugFromDiscord(discordData)
      
      if (!bug) {
        return NextResponse.json(
          { success: false, error: 'Invalid Discord data' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, data: bug }, { status: 201 })
    } catch (error) {
      console.error('Error creating bug from Discord:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create bug from Discord data' },
        { status: 500 }
      )
    }
  }

  async getBugById(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const bug = await this.bugService.getBugById(id)
      
      if (!bug) {
        return NextResponse.json(
          { success: false, error: 'Bug not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: bug })
    } catch (error) {
      console.error('Error getting bug:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get bug' },
        { status: 500 }
      )
    }
  }

  async getAllBugs(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url)
      
      const params = {
        status: searchParams.get('status') as BugStatus | undefined,
        type: searchParams.get('type') as BugType | undefined,
        assignedToId: searchParams.get('assignedToId') || undefined,
        reportedById: searchParams.get('reportedById') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      }

      const result = await this.bugService.getAllBugs(params)
      return NextResponse.json({ success: true, data: result })
    } catch (error) {
      console.error('Error getting bugs:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get bugs' },
        { status: 500 }
      )
    }
  }

  async updateBug(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const body: UpdateBugRequest = await req.json()
      const bug = await this.bugService.updateBug(id, body)
      
      return NextResponse.json({ success: true, data: bug })
    } catch (error) {
      console.error('Error updating bug:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update bug' },
        { status: 500 }
      )
    }
  }

  async updateBugStatus(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      const { status }: { status: BugStatus } = await req.json()
      const bug = await this.bugService.updateBugStatus(id, status)
      
      return NextResponse.json({ success: true, data: bug })
    } catch (error) {
      console.error('Error updating bug status:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update bug status' },
        { status: 500 }
      )
    }
  }

  async deleteBug(req: NextRequest, id: string): Promise<NextResponse> {
    try {
      await this.bugService.deleteBug(id)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting bug:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete bug' },
        { status: 500 }
      )
    }
  }

  async addComment(req: NextRequest, bugId: string, userId: string): Promise<NextResponse> {
    try {
      const body = await req.json()
      const bug = await this.bugService.addComment(bugId, userId, body)
      
      return NextResponse.json({ success: true, data: bug })
    } catch (error) {
      console.error('Error adding comment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to add comment' },
        { status: 500 }
      )
    }
  }

  async getKanbanData(req: NextRequest): Promise<NextResponse> {
    try {
      const kanbanData = await this.bugService.getKanbanData()
      return NextResponse.json({ success: true, data: kanbanData })
    } catch (error) {
      console.error('Error getting kanban data:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get kanban data' },
        { status: 500 }
      )
    }
  }

  async getStatistics(req: NextRequest): Promise<NextResponse> {
    try {
      const stats = await this.bugService.getStatistics()
      return NextResponse.json({ success: true, data: stats })
    } catch (error) {
      console.error('Error getting statistics:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get statistics' },
        { status: 500 }
      )
    }
  }
} 