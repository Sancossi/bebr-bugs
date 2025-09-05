import { Bug, Comment, User } from '@prisma/client'

// Enum'ы для SQLite
export enum BugType {
  Gameplay = 'Gameplay',
  GameIdeas = 'GameIdeas',
  UI = 'UI',
  Performance = 'Performance',
  Audio = 'Audio',
  Graphics = 'Graphics',
  Network = 'Network',
  Other = 'Other',
}

export enum BugStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  READY_TO_RELEASE = 'READY_TO_RELEASE',
  CLOSED = 'CLOSED',
}

export enum BugPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type BugWithRelations = Bug & {
  reportedBy?: User | null
  assignedTo?: User | null
  comments?: (Comment & { author: User })[]
}

export type CommentWithAuthor = Comment & {
  author: User
}

export interface DiscordBugReport {
  type: 0
  content: string
  mentions: any[]
  mention_roles: any[]
  attachments: any[]
  embeds: Array<{
    type: string
    title: string
    description?: string
    color: number
    fields: Array<{
      name: string
      value: string
      inline: boolean
    }>
    image?: {
      url: string
      proxy_url: string
      width: number
      height: number
      content_type: string
    }
  }>
  timestamp: string
  id: string
  channel_id: string
  author: {
    id: string
    username: string
    bot: boolean
  }
  webhook_id?: string
  thread?: {
    id: string
    name: string
  }
}

export interface CreateBugRequest {
  title: string
  description?: string
  type: BugType
  priority: BugPriority
  assignedToId?: string
}

export interface UpdateBugRequest {
  title?: string
  description?: string
  status?: BugStatus
  priority?: BugPriority
  assignedToId?: string
}

export interface CreateCommentRequest {
  content: string
  attachmentUrl?: string
}
