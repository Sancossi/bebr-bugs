const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('👤 Создаем тестового пользователя...')

  try {
    // Проверяем, есть ли уже пользователь
    const existingUser = await prisma.user.findFirst()
    
    if (existingUser) {
      console.log('✅ Пользователь уже существует:', existingUser.name)
      return existingUser
    }

    // Создаем нового тестового пользователя
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://via.placeholder.com/150',
        discordId: '123456789',
      },
    })

    console.log('✅ Создан тестовый пользователь:', user.name)
    return user
  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error)
    throw error
  }
}

createTestUser()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 