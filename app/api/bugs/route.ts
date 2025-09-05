import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { BugController } from '../../../src/controllers/BugController'

const bugController = new BugController()

export async function GET(req: NextRequest) {
  return await bugController.getAllBugs(req)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return await bugController.createBug(req, session.user.id)
} 