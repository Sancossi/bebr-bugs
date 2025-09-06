const { PrismaClient: SQLitePrismaClient } = require('@prisma/client')
const { PrismaClient: PostgresPrismaClient } = require('@prisma/client')

// SQLite клиент для чтения данных
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

// PostgreSQL клиент для записи данных
const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrateData() {
  try {
    console.log('🚀 Начинаем миграцию данных с SQLite на PostgreSQL...')
    
    // Миграция пользователей
    console.log('👥 Мигрируем пользователей...')
    const users = await sqliteClient.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    })
    
    for (const user of users) {
      const { accounts, sessions, ...userData } = user
      
      await postgresClient.user.upsert({
        where: { id: user.id },
        create: userData,
        update: userData
      })
      
      // Мигрируем аккаунты
      for (const account of accounts) {
        await postgresClient.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          create: account,
          update: account
        })
      }
      
      // Мигрируем сессии
      for (const session of sessions) {
        await postgresClient.session.upsert({
          where: { id: session.id },
          create: session,
          update: session
        })
      }
    }
    
    console.log(`✅ Мигрировано ${users.length} пользователей`)
    
    // Миграция багов
    console.log('🐛 Мигрируем баги...')
    const bugs = await sqliteClient.bug.findMany({
      include: {
        comments: true
      }
    })
    
    for (const bug of bugs) {
      const { comments, customData, attachmentUrls, ...bugData } = bug
      
      // Преобразуем строковые JSON в объекты для PostgreSQL
      const processedBugData = {
        ...bugData,
        customData: customData ? JSON.parse(customData) : null,
        attachmentUrls: attachmentUrls ? JSON.parse(attachmentUrls) : null
      }
      
      await postgresClient.bug.upsert({
        where: { id: bug.id },
        create: processedBugData,
        update: processedBugData
      })
      
      // Мигрируем комментарии
      for (const comment of comments) {
        await postgresClient.comment.upsert({
          where: { id: comment.id },
          create: comment,
          update: comment
        })
      }
    }
    
    console.log(`✅ Мигрировано ${bugs.length} багов`)
    
    console.log('🎉 Миграция завершена успешно!')
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Запуск миграции
if (require.main === module) {
  migrateData()
}

module.exports = { migrateData } 