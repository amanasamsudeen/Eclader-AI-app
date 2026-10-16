/**
 * Client-side image optimization utility for Eclader AI
 * Resizes and compresses device photographs to optimize network payload
 * and accelerate Gemini Vision multimodal inference times.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  base64Data: string;
  mimeType: string;
  width: number;
  height: number;
  approxSizeKb: number;
}

export async function optimizeImageForAnalysis(
  source: File | string,
  maxDimension = 1200,
  quality = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          // Fallback if dimensions not detected
          const rawBase64 = typeof source === 'string' ? source : '';
          resolve({
            dataUrl: rawBase64,
            base64Data: rawBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
            mimeType: 'image/jpeg',
            width: 800,
            height: 600,
            approxSizeKb: Math.round(rawBase64.length / 1024),
          });
          return;
        }

        // Maintain aspect ratio while bounding within maxDimension
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
          throw new Error('Unable to create canvas context for image processing');
        }

        // Draw and compress to JPEG for optimal Gemini vision latency
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
        const approxSizeKb = Math.round(base64Data.length * 0.75 / 1024);

        resolve({
          dataUrl,
          base64Data,
          mimeType: 'image/jpeg',
          width,
          height,
          approxSizeKb,
        });
      } catch (err) {
        // Fallback for tainted canvas or cross-origin restrictions
        console.warn('Canvas optimization fallback triggered:', err);
        if (typeof source === 'string') {
          resolve({
            dataUrl: source,
            base64Data: source.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
            mimeType: 'image/jpeg',
            width: 800,
            height: 600,
            approxSizeKb: Math.round(source.length / 1024),
          });
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            resolve({
              dataUrl: res,
              base64Data: res.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
              mimeType: source.type || 'image/jpeg',
              width: 800,
              height: 600,
              approxSizeKb: Math.round(source.size / 1024),
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(source);
        }
      }
    };

    img.onload = processImage;
    img.onerror = (e) => {
      console.warn('Image loading error in optimizer:', e);
      // If loading error occurs on string, fall back
      if (typeof source === 'string') {
        resolve({
          dataUrl: source,
          base64Data: source.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
          mimeType: 'image/jpeg',
          width: 800,
          height: 600,
          approxSizeKb: Math.round(source.length / 1024),
        });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve({
            dataUrl: res,
            base64Data: res.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
            mimeType: source.type || 'image/jpeg',
            width: 800,
            height: 600,
            approxSizeKb: Math.round(source.size / 1024),
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      }
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}
