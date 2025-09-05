import { NextRequest } from 'next/server'
import { BugController } from '../../../../src/controllers/BugController'

const bugController = new BugController()

export async function GET(req: NextRequest) {
  return await bugController.getKanbanData(req)
} 