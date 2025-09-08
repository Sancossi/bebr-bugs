import fs from 'fs'
import path from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const streamPipeline = promisify(pipeline)

export class ImageService {
  private uploadDir: string

  constructor() {
    // Создаем папку для загрузок в public/uploads
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads')
    this.ensureUploadDir()
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
      console.log('📁 Создана папка для загрузок:', this.uploadDir)
    }
  }

  /**
   * Скачивает изображение из Discord CDN и сохраняет локально
   */
  async downloadDiscordImage(url: string, bugId: string): Promise<string | null> {
    try {
      console.log('📥 Скачиваем изображение:', url)

      // Проверяем, что это Discord CDN ссылка
      if (!url.includes('cdn.discordapp.com')) {
        console.log('⚠️ Не Discord CDN ссылка, оставляем как есть')
        return url
      }

      // Извлекаем расширение файла из URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const fileExtension = fileName.split('.')[1]?.split('?')[0] || 'png'
      
      // Генерируем имя файла
      const localFileName = `bug_${bugId}_${Date.now()}.${fileExtension}`
      const localFilePath = path.join(this.uploadDir, localFileName)
      const publicUrl = `/uploads/${localFileName}`

      // Скачиваем файл
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Сохраняем файл
      const fileStream = createWriteStream(localFilePath)
      await streamPipeline(response.body as any, fileStream)

      console.log('✅ Изображение сохранено:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('❌ Ошибка скачивания изображения:', error)
      return null
    }
  }

  /**
   * Проверяет доступность изображения по URL
   */
  async checkImageAvailability(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Удаляет локальное изображение
   */
  async deleteLocalImage(publicUrl: string): Promise<boolean> {
    try {
      if (!publicUrl.startsWith('/uploads/')) {
        return false
      }

      const fileName = publicUrl.replace('/uploads/', '')
      const filePath = path.join(this.uploadDir, fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('🗑️ Удалено изображение:', publicUrl)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Ошибка удаления изображения:', error)
      return false
    }
  }
} 