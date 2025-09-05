const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Добавляем тестовые данные...')

  // Создаем тестового пользователя
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://via.placeholder.com/150',
      discordId: '123456789',
    },
  })

  console.log('✅ Создан пользователь:', user.name)

  // Создаем тестовые баги
  const bugs = [
    {
      title: 'Звук не работает в игре',
      description: 'При запуске игры полностью отсутствует звук. Проблема воспроизводится на всех уровнях.',
      type: 'Audio',
      status: 'NEW',
      priority: 'HIGH',
      level: 'E01_Level_0_DEMO',
      playerPosition: '(X=84.61,Y=1825.10,Z=51818.11)',
      fps: 69.27,
      gpu: 'NVIDIA GeForce RTX 2060 SUPER',
      cpu: 'AMD Ryzen 7 5800X 8-Core Processor',
      os: '10.0.19045.1.768.64bit',
      reportedById: user.id,
      screenshotUrl: 'https://via.placeholder.com/800x450?text=Audio+Bug+Screenshot'
    },
    {
      title: 'Добавить лут на стол',
      description: 'Было бы круто на столе было это место. Я хз кажется логичным чтобы там почти всегда был какой нить мусор',
      type: 'GameIdeas',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      level: 'E01_Level_0_DEMO',
      playerPosition: '(X=-2009.75,Y=-2750.00,Z=419.68)',
      fps: 130.88,
      gpu: 'NVIDIA GeForce RTX 4090',
      cpu: '13th Gen Intel(R) Core(TM) i9-13900KF',
      os: '10.0.22631.1.256.64bit',
      reportedById: user.id,
      assignedToId: user.id,
      screenshotUrl: 'https://via.placeholder.com/800x450?text=Game+Idea+Screenshot'
    },
    {
      title: 'Падение FPS в локации склада',
      description: 'Критическое падение производительности при входе в локацию склада. FPS падает с 60 до 15.',
      type: 'Performance',
      status: 'TESTING',
      priority: 'CRITICAL',
      level: 'Warehouse_Level_01',
      playerPosition: '(X=1250.30,Y=-890.45,Z=125.67)',
      fps: 15.2,
      gpu: 'NVIDIA GeForce GTX 1660',
      cpu: 'Intel Core i5-9400F',
      os: '10.0.19044.1.256.64bit',
      reportedById: user.id,
      assignedToId: user.id,
    },
    {
      title: 'Исправлена ошибка загрузки текстур',
      description: 'Исправлена проблема с загрузкой высокополигональных текстур на слабых видеокартах.',
      type: 'Graphics',
      status: 'READY_TO_RELEASE',
      priority: 'MEDIUM',
      level: 'All_Levels',
      reportedById: user.id,
      assignedToId: user.id,
    },
    {
      title: 'Баг с инвентарем исправлен',
      description: 'Исправлена ошибка дублирования предметов в инвентаре при быстром клике.',
      type: 'Gameplay',
      status: 'CLOSED',
      priority: 'HIGH',
      level: 'All_Levels',
      reportedById: user.id,
      assignedToId: user.id,
    }
  ]

  for (const bugData of bugs) {
    const bug = await prisma.bug.create({
      data: bugData,
    })
    console.log('✅ Создан баг:', bug.title)

    // Добавляем комментарий к каждому багу
    await prisma.comment.create({
      data: {
        content: `Комментарий к багу "${bug.title}". Это тестовый комментарий для демонстрации функционала.`,
        bugId: bug.id,
        authorId: user.id,
      },
    })
  }

  console.log('🎉 Тестовые данные успешно добавлены!')
  console.log('📊 Статистика:')
  console.log(`- Пользователей: ${await prisma.user.count()}`)
  console.log(`- Багов: ${await prisma.bug.count()}`)
  console.log(`- Комментариев: ${await prisma.comment.count()}`)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при добавлении тестовых данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 