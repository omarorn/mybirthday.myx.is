/**
 * Image Processing Utilities
 * Extracted from: rusl.myx.is (production)
 *
 * Client-side image cropping, overlay drawing, and motion detection.
 * Framework-agnostic — works with any Canvas-capable environment.
 */

export interface CropBox {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  width: number; // 0-1 normalized
  height: number; // 0-1 normalized
}

export interface DetectedObject {
  label: string;
  category?: string;
  confidence?: number;
  cropBox: CropBox;
  color?: string;
  icon?: string;
}

/**
 * Crop an image using normalized coordinates (0-1 scale).
 * Returns base64 JPEG string.
 */
export async function cropImageClient(
  imageDataUrl: string,
  cropBox: CropBox,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      // Convert normalized coords to pixel coords with bounds checking
      const sx = Math.max(0, Math.min(1, cropBox.x)) * img.width;
      const sy = Math.max(0, Math.min(1, cropBox.y)) * img.height;
      const sw = Math.max(0, Math.min(1 - cropBox.x, cropBox.width)) * img.width;
      const sh = Math.max(0, Math.min(1 - cropBox.y, cropBox.height)) * img.height;

      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

/**
 * Draw bounding box overlays for detected objects on an image.
 * Renders colored boxes with labels.
 */
export function drawCropOverlay(
  canvas: HTMLCanvasElement,
  imageDataUrl: string,
  objects: DetectedObject[]
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    objects.forEach((obj, index) => {
      const { cropBox, label, icon, color } = obj;
      const x = cropBox.x * img.width;
      const y = cropBox.y * img.height;
      const w = cropBox.width * img.width;
      const h = cropBox.height * img.height;

      const boxColor = color || getColorForIndex(index);

      // Draw bounding box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = index === 0 ? 3 : 2;
      ctx.setLineDash(index === 0 ? [] : [5, 5]);
      ctx.strokeRect(x, y, w, h);

      // Draw label background
      const labelText = `${index + 1}. ${icon || ''} ${label}`;
      ctx.font = 'bold 14px sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = boxColor;
      ctx.fillRect(x, y - 22, textWidth + 8, 22);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x + 4, y - 6);
    });
  };
  img.src = imageDataUrl;
}

/**
 * Simple motion detection between two frames.
 * Compares pixel differences to detect movement.
 */
export function detectMotion(
  currentFrame: ImageData,
  previousFrame: ImageData,
  threshold: number = 30,
  sensitivityPercent: number = 5
): boolean {
  if (currentFrame.width !== previousFrame.width || currentFrame.height !== previousFrame.height) {
    return false;
  }

  const totalPixels = currentFrame.width * currentFrame.height;
  let changedPixels = 0;

  for (let i = 0; i < currentFrame.data.length; i += 4) {
    const rDiff = Math.abs(currentFrame.data[i] - previousFrame.data[i]);
    const gDiff = Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]);
    const bDiff = Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);

    if (rDiff + gDiff + bDiff > threshold * 3) {
      changedPixels++;
    }
  }

  return (changedPixels / totalPixels) * 100 > sensitivityPercent;
}

function getColorForIndex(index: number): string {
  const colors = ['#FF6B35', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
  return colors[index % colors.length];
}
