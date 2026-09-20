/**
 * Utilitários para otimização e conversão de imagens no cliente:
 * 1. Converte imagens enviadas para .webp comprimido antes de subir para o Supabase Storage.
 * 2. Permite o download de qualquer imagem diretamente em formato .png de alta qualidade.
 */

export interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

/**
 * Converte qualquer arquivo de imagem para .webp de forma rápida e eficiente usando HTML5 Canvas.
 * Arquivos não suportados ou vídeos são retornados sem alteração.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Se não for imagem ou se for GIF animado, não converte
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file
  }

  const { quality = 0.82, maxWidth = 1920, maxHeight = 1920 } = options

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      // Redimensionamento proporcional se exceder os limites máximos
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        // Fallback: se o contexto 2D falhar, retorna o arquivo original
        resolve(file)
        return
      }

      // Suavização de alta qualidade
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          // Troca a extensão do nome do arquivo para .webp
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          const webpFileName = `${baseName}.webp`

          const webpFile = new File([blob], webpFileName, {
            type: 'image/webp',
            lastModified: Date.now()
          })

          resolve(webpFile)
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Se houver erro de carregamento da imagem, retorna o arquivo original
      resolve(file)
    }

    img.src = objectUrl
  })
}

/**
 * Faz download de uma imagem (mesmo que salva como .webp no Supabase) convertida diretamente para .png
 */
export async function downloadImageAsPng(
  imageUrl: string,
  suggestedName = 'alura-imagem'
): Promise<void> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Falha ao carregar imagem para download'))
      img.src = imageUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Não foi possível inicializar canvas')

    ctx.drawImage(img, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return

      const cleanName = suggestedName.replace(/\.[^/.]+$/, '') + '.png'
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = cleanName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    }, 'image/png')
  } catch (err) {
    // Fallback: se falhar o canvas/CORS, força o download direto com nome .png
    const cleanName = suggestedName.replace(/\.[^/.]+$/, '') + '.png'
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = cleanName
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
