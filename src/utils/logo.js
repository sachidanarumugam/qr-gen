const MAX_LOGO_PX = 192

// Shrinks an uploaded image before it is stored with a recent code.
export function readLogoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('logo'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('logo'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('logo'))
      image.onload = () => {
        const scale = Math.min(1, MAX_LOGO_PX / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.imageSmoothingEnabled = true
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
