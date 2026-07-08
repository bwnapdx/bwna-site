import sharp from 'sharp';
import path from 'node:path';

// True when the image at public/<imagePath> is meaningfully taller than wide
// (accounting for EXIF rotation). Used to float tall hero photos alongside the
// article text rather than stretching them full-width.
export async function isPortraitImage(imagePath) {
  if (!imagePath) return false;
  try {
    const meta = await sharp(path.join(process.cwd(), 'public', imagePath)).metadata();
    let { width: w, height: h } = meta;
    if (meta.orientation && meta.orientation >= 5) [w, h] = [h, w];
    return Boolean(w && h) && h > w * 1.1;
  } catch {
    return false;
  }
}
