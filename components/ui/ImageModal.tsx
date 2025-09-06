'use client'

import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'

interface ImageModalProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Сброс состояния при открытии/закрытии модала
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'screenshot'
    link.click()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Панель управления */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomOut()
          }}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          title="Уменьшить"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomIn()
          }}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          title="Увеличить"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRotate()
          }}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          title="Повернуть"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          title="Скачать"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Информация о масштабе */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Изображение */}
      <div 
        className="relative max-w-full max-h-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-none transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: 'center center'
          }}
          draggable={false}
        />
      </div>

      {/* Подсказки */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <div>Клик вне изображения или ESC - закрыть</div>
          {zoom > 1 && <div>Перетащите изображение для перемещения</div>}
        </div>
      </div>
    </div>
  )
} 