import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react'

interface ImageLightboxModalProps {
  isOpen: boolean
  imageUrl: string | null
  imageName?: string
  onClose: () => void
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  imageName = 'imagem-alura',
  onClose,
}) => {
  const [isZoomed, setIsZoomed] = useState(false)

  // Reseta zoom quando abre nova imagem
  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false)
    }
  }, [isOpen, imageUrl])

  // Fecha com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !imageUrl) return null

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = imageName.includes('.') ? imageName : `${imageName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
        onClick={onClose}
      >
        {/* Barra superior de ações flutuante */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none"
        >
          <div className="flex items-center gap-2 pointer-events-auto bg-[#001609]/80 border border-[#003516] backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg max-w-sm truncate">
            <span className="text-xs font-semibold text-zinc-300 truncate">
              {imageName}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto bg-[#001609]/80 border border-[#003516] backdrop-blur-md p-1 rounded-xl shadow-lg">
            {/* Zoom In/Out */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsZoomed((prev) => !prev)
              }}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#002a12] transition-colors"
              title={isZoomed ? 'Reduzir visualização' : 'Ampliar imagem'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4 text-[#39ff88]" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            {/* Abrir original */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#002a12] transition-colors"
              title="Abrir imagem original no navegador"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Baixar */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#002a12] transition-colors"
              title="Baixar imagem"
            >
              <Download className="w-4 h-4 text-[#00dfa0]" />
            </button>

            <div className="w-[1px] h-4 bg-[#003516] mx-0.5" />

            {/* Fechar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Imagem Central */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative max-w-full max-h-full flex items-center justify-center overflow-auto p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={imageName}
            onClick={() => setIsZoomed((prev) => !prev)}
            className={`rounded-xl object-contain transition-all duration-300 cursor-zoom-${isZoomed ? 'out' : 'in'} shadow-2xl border border-[#003516]/40 ${
              isZoomed
                ? 'max-w-none max-h-none scale-125'
                : 'max-w-[92vw] max-h-[85vh]'
            }`}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
