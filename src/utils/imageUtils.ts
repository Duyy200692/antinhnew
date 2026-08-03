import { storage } from '../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Automatically compresses and converts any uploaded image file (JPG, PNG, HEIC, WEBP, etc.)
 * to `.webp` format using HTML5 Canvas.
 *
 * @param file The original image file from input
 * @param maxDimension The max width/height in pixels (default 1200)
 * @param quality The WEBP quality from 0 to 1 (default 0.82)
 * @returns Promise<string> A base64 data URL in image/webp format
 */
export async function compressImageToWebp(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<{ webpDataUrl: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2d context not available'));
          return;
        }

        // Draw image with smooth scaling
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to image/webp format
        const webpDataUrl = canvas.toDataURL('image/webp', quality);

        // Estimate byte size from base64 length
        const base64Length = webpDataUrl.split(',')[1]?.length || 0;
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          webpDataUrl,
          originalSize: file.size,
          compressedSize,
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads a WebP data URL to Firebase Storage and returns the public download URL.
 * Falls back immediately to returning the .webp Data URL directly if Firebase Storage is not enabled or slow.
 */
export async function uploadWebpImageToFirebase(
  webpDataUrl: string,
  folder = 'menu_dishes'
): Promise<string> {
  // Promise with 1.5 second timeout to prevent long hanging network retries
  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error('Firebase Storage timeout - fallback to WebP Data URL')), 1500)
  );

  const uploadTask = (async () => {
    const filename = `${folder}/dish_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
    const storageRef = ref(storage, filename);
    await uploadString(storageRef, webpDataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  })();

  try {
    const result = await Promise.race([uploadTask, timeoutPromise]);
    return result;
  } catch (err) {
    console.info(
      'Sử dụng trực tiếp chuỗi nén .WEBP siêu nhẹ (Instant WebP Data URL):',
      err instanceof Error ? err.message : err
    );
    // Return compressed webp Data URL instantly so the dish image is saved seamlessly
    return webpDataUrl;
  }
}
