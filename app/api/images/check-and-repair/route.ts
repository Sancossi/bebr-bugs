import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { BugService } from '../../../../src/services/BugService'
import { ImageService } from '../../../../src/services/ImageService'

const bugService = new BugService()
const imageService = new ImageService()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔧 Начинаем проверку и восстановление изображений...")
    
    // Получаем все баги с Discord изображениями
    const { bugs } = await bugService.getAllBugs({ limit: 1000 })
    
    let checkedCount = 0
    let brokenCount = 0
    let repairedCount = 0
    let errors = 0
    
    const results = []

    for (const bug of bugs) {
      if (!bug.screenshotUrl || !bug.screenshotUrl.includes('cdn.discordapp.com')) {
        continue
      }

      checkedCount++
      
      try {
        console.log(`🔍 Проверяем изображение для бага ${bug.id}...`)
        
        // Проверяем доступность изображения
        const isAvailable = await imageService.checkImageAvailability(bug.screenshotUrl)
        
        if (!isAvailable) {
          brokenCount++
          console.log(`❌ Изображение недоступно для бага ${bug.id}: ${bug.screenshotUrl}`)
          
          // Пытаемся найти оригинальное сообщение в Discord и скачать изображение заново
          // Для этого нужно реализовать получение сообщения через Discord API
          
          results.push({
            bugId: bug.id,
            title: bug.title,
            originalUrl: bug.screenshotUrl,
            status: 'broken',
            action: 'needs_manual_check'
          })
        } else {
          results.push({
            bugId: bug.id,
            title: bug.title,
            originalUrl: bug.screenshotUrl,
            status: 'ok'
          })
        }
        
      } catch (error) {
        errors++
        console.error(`❌ Ошибка проверки изображения для бага ${bug.id}:`, error)
        
        results.push({
          bugId: bug.id,
          title: bug.title,
          originalUrl: bug.screenshotUrl,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const summary = {
      total: bugs.length,
      checked: checkedCount,
      broken: brokenCount,
      repaired: repairedCount,
      errors,
      timestamp: new Date().toISOString()
    }
    
    console.log("🎉 Проверка изображений завершена:", summary)
    
    return NextResponse.json({
      success: true,
      summary,
      results
    })
    
  } catch (error) {
    console.error("💥 Ошибка проверки изображений:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 