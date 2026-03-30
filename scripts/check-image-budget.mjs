import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const IMAGES_DIR = 'dist/images';
const MAX_TOTAL_BYTES = 3 * 1024 * 1024;
const MAX_SINGLE_BYTES = 450 * 1024;

const files = readdirSync(IMAGES_DIR)
  .filter((file) => file.endsWith('.jpeg'))
  .sort()
  .map((file) => path.join(IMAGES_DIR, file));

if (!files.length) {
  console.error(`[image-budget] No files matched ${IMAGES_DIR}/*.jpeg. Run the production build first.`);
  process.exit(1);
}

const entries = files.map((file) => {
  const size = statSync(file).size;
  return { file, size };
});

const totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
const oversized = entries.filter((entry) => entry.size > MAX_SINGLE_BYTES);

for (const entry of entries.slice().sort((a, b) => b.size - a.size).slice(0, 5)) {
  console.log(`[image-budget] ${path.basename(entry.file)} ${(entry.size / 1024).toFixed(1)} KB`);
}

console.log(`[image-budget] total ${(totalBytes / 1024).toFixed(1)} KB`);

if (totalBytes > MAX_TOTAL_BYTES) {
  console.error(
    `[image-budget] Total gallery image budget exceeded: ${(totalBytes / 1024).toFixed(1)} KB > ${(MAX_TOTAL_BYTES / 1024).toFixed(1)} KB`
  );
  process.exit(1);
}

if (oversized.length) {
  for (const entry of oversized) {
    console.error(
      `[image-budget] ${path.basename(entry.file)} exceeded single-image budget: ${(entry.size / 1024).toFixed(1)} KB > ${(MAX_SINGLE_BYTES / 1024).toFixed(1)} KB`
    );
  }
  process.exit(1);
}

console.log('[image-budget] passed');
