'use client'

import { useState } from 'react'
import { ImageModal } from './ImageModal'
import { ZoomIn } from 'lucide-react'

interface ClickableImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  style?: React.CSSProperties
}

export function ClickableImage({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  style 
}: ClickableImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-all duration-200 group-hover:brightness-75 ${className}`}
          style={style}
        />
        
        {/* Overlay с иконкой увеличения */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-20 rounded-full p-3">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Подсказка */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Клик для увеличения
          </div>
        </div>
      </div>

      <ImageModal
        src={src}
        alt={alt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 