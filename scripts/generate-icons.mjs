// Rasterises assets/logo.svg into the PNG icon sizes the manifest needs.
// Run with: npm run icons
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

const SIZES = [16, 32, 48, 96, 128];
const OUT_DIR = 'public/icon';

const svg = await readFile('assets/logo.svg');
await mkdir(OUT_DIR, { recursive: true });

// Rasterise once at high resolution, then downscale for crisp small sizes.
const base = await sharp(svg, { density: 384 })
  .resize(512, 512, { fit: 'contain' })
  .png()
  .toBuffer();

for (const size of SIZES) {
  const file = `${OUT_DIR}/${size}.png`;
  await sharp(base).resize(size, size).png().toFile(file);
  console.log(`wrote ${file}`);
}
