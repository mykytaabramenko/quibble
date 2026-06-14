// Rasterises all Chrome Web Store assets (promo tiles + screenshots) from
// their SVG sources. Run with: npm run store-assets
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const DIR = 'assets/store';
const JOBS = [
  { svg: 'promo-small.svg', out: 'promo-small-440x280.png', w: 440, h: 280 },
  { svg: 'promo-marquee.svg', out: 'promo-marquee-1400x560.png', w: 1400, h: 560 },
  { svg: 'screenshot-1.svg', out: 'screenshot-1-1280x800.png', w: 1280, h: 800 },
  { svg: 'screenshot-2.svg', out: 'screenshot-2-1280x800.png', w: 1280, h: 800 },
  { svg: 'screenshot-3.svg', out: 'screenshot-3-1280x800.png', w: 1280, h: 800 },
  { svg: 'screenshot-4.svg', out: 'screenshot-4-1280x800.png', w: 1280, h: 800 },
];

for (const job of JOBS) {
  const svg = await readFile(`${DIR}/${job.svg}`);
  await sharp(svg, { density: 150 })
    .resize(job.w, job.h, { fit: 'fill' })
    .png()
    .toFile(`${DIR}/${job.out}`);
  console.log(`wrote ${job.out}`);
}
