import { NextRequest, NextResponse } from 'next/server'
import { BugController } from '../../../../../src/controllers/BugController'

const bugController = new BugController()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, authorId, attachmentUrl } = await request.json()
    
    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Контент и ID автора обязательны' },
        { status: 400 }
      )
    }

    const mockRequest = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ content, attachmentUrl })
    })
    
    const response = await bugController.addComment(mockRequest, params.id, authorId)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    const comment = result.data

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Ошибка создания комментария:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 