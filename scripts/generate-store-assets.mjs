// Rasterises the Chrome Web Store promo tiles from their SVG sources.
// Run with: npm run store-assets
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const DIR = 'assets/store';
const JOBS = [
  { svg: `${DIR}/promo-small.svg`, out: `${DIR}/promo-small-440x280.png`, w: 440, h: 280 },
  { svg: `${DIR}/promo-marquee.svg`, out: `${DIR}/promo-marquee-1400x560.png`, w: 1400, h: 560 },
];

for (const job of JOBS) {
  const svg = await readFile(job.svg);
  await sharp(svg, { density: 150 })
    .resize(job.w, job.h, { fit: 'fill' })
    .png()
    .toFile(job.out);
  console.log(`wrote ${job.out}`);
}
