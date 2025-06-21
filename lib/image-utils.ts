/**
 * Compresses and converts an image file to base64 format
 * @param file The image file to process
 * @param maxWidth Maximum width of the image in pixels
 * @param maxHeight Maximum height of the image in pixels
 * @param quality JPEG quality (0-1)
 * @returns Promise that resolves to a base64 string
 */
export async function compressImageToBase64(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64
        const base64 = canvas.toDataURL("image/jpeg", quality)
        resolve(base64)
      }
      img.onerror = (error) => {
        reject(error)
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

/**
 * Validates if a file is an image with allowed extensions
 * @param file The file to validate
 * @param allowedExtensions Array of allowed extensions (default: jpg, jpeg, png, gif, webp)
 * @returns Boolean indicating if the file is valid
 */
export function isValidImageFile(file: File, allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"]): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() || ""
  return allowedExtensions.includes(extension)
}

/**
 * Validates if a file size is within the allowed limit
 * @param file The file to validate
 * @param maxSizeInMB Maximum file size in MB
 * @returns Boolean indicating if the file size is valid
 */
export function isValidFileSize(file: File, maxSizeInMB = 5): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}
