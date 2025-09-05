const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBug() {
  const bugId = 'cmf6wrzdd000663cyd8wwb6cj'
  
  console.log('🔍 Проверяем баг с ID:', bugId)
  
  try {
    // Ищем баг по ID
    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
      include: {
        reportedBy: true,
        assignedTo: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!bug) {
      console.log('❌ Баг не найден!')
      
      // Покажем все баги в базе
      const allBugs = await prisma.bug.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      
      console.log('\n📋 Все баги в базе:')
      allBugs.forEach((b, i) => {
        console.log(`${i + 1}. ${b.title} (ID: ${b.id}) - ${b.status}`)
      })
      
      if (allBugs.length > 0) {
        console.log(`\n💡 Попробуйте открыть: http://localhost:3000/bugs/${allBugs[0].id}`)
      }
    } else {
      console.log('✅ Баг найден!')
      console.log('📝 Заголовок:', bug.title)
      console.log('📊 Статус:', bug.status)
      console.log('🏷️ Тип:', bug.type)
      console.log('⭐ Приоритет:', bug.priority)
      console.log('📅 Создан:', bug.createdAt)
      console.log('💬 Комментариев:', bug.comments?.length || 0)
      
      if (bug.reportedBy) {
        console.log('👤 Автор:', bug.reportedBy.name)
      }
      
      if (bug.screenshotUrl) {
        console.log('📸 Скриншот:', bug.screenshotUrl)
      }
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkBug() 