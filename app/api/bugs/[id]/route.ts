import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { BugController } from '../../../../src/controllers/BugController'

const bugController = new BugController()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return await bugController.getBugById(req, params.id)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return await bugController.updateBug(req, params.id)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return await bugController.deleteBug(req, params.id)
} 