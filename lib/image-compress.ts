/**
 * Compresses an image file in the browser before upload.
 *
 * Uses createImageBitmap + canvas, which decodes/downsamples the image
 * more efficiently than loading it into an <img> tag first — this avoids
 * the "low memory" crash that happens when a full-resolution camera photo
 * (often 4000x3000px+) gets loaded and re-encoded on a low-RAM phone.
 */

type CompressOptions = {
  maxWidthOrHeight?: number;
  quality?: number;
  mimeType?: string;
};

const DEFAULTS: Required<CompressOptions> = {
  maxWidthOrHeight: 1600,
  quality: 0.8,
  mimeType: 'image/webp',
};

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidthOrHeight, quality, mimeType } = { ...DEFAULTS, ...options };

  // Skip compression for formats where it doesn't make sense or can break
  // (e.g. GIF animations, SVG).
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxWidthOrHeight / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(targetWidth, targetHeight)
        : Object.assign(document.createElement('canvas'), {
            width: targetWidth,
            height: targetHeight,
          });

    const ctx = canvas.getContext('2d') as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;

    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob: Blob = await new Promise((resolve, reject) => {
      if (canvas instanceof OffscreenCanvas) {
        canvas
          .convertToBlob({ type: mimeType, quality })
          .then(resolve)
          .catch(reject);
      } else {
        (canvas as HTMLCanvasElement).toBlob(
          (b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen comprimida'))),
          mimeType,
          quality
        );
      }
    });

    // If compression somehow produced a bigger file (rare, e.g. tiny source
    // images), keep the original instead.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: mimeType, lastModified: Date.now() });
  } catch {
    // If compression fails for any reason (unsupported format, decode error),
    // fall back to the original file rather than blocking the upload.
    return file;
  }
}
