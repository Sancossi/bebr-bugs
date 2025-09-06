import { Bug, Comment, User } from '@prisma/client'

// Enum'ы для PostgreSQL (должны соответствовать schema.prisma)
export enum BugType {
  Bug = 'Bug',
  Feature = 'Feature', 
  Improvement = 'Improvement',
  Task = 'Task',
  Other = 'Other',
}

export enum BugStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  READY_TO_RELEASE = 'READY_TO_RELEASE',
  CLOSED = 'CLOSED',
  REQUIRES_DISCUSSION = 'REQUIRES_DISCUSSION',
  OUTDATED = 'OUTDATED',
}

export enum BugPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type BugWithRelations = Bug & {
  reportedBy: User
  assignedTo?: User | null
  comments: CommentWithAuthor[]
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
  reactions?: Array<{
    emoji: {
      name: string
      id?: string
    }
    count: number
    users?: Array<{
      id: string
      username: string
    }>
  }>
  severity?: string
}

export interface CreateBugRequest {
  title: string
  description?: string
  type: BugType
  status?: BugStatus
  priority: BugPriority
  assignedToId?: string
}

export interface UpdateBugRequest {
  title?: string
  description?: string
  type?: BugType
  status?: BugStatus
  priority?: BugPriority
  assignedToId?: string
}

export interface CreateCommentRequest {
  content: string
  attachmentUrl?: string
}
