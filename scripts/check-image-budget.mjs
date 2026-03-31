import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const GENERATED_IMAGES_DIR = 'src/generated/gallery';
const PUBLIC_DIR = 'public';
const PUBLIC_IMAGE_EXTENSIONS = /\.(avif|webp|png|jpe?g)$/i;
const CRITICAL_IMAGES = ['eb1', 'eb2', 'eb3'];
const MAX_CRITICAL_TOTAL_BYTES = 1024 * 1024;
const MAX_SINGLE_MAIN_BYTES = 450 * 1024;
const MAX_SINGLE_THUMB_BYTES = 80 * 1024;

const walkPublicImages = (dir) => {
  const violations = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      violations.push(...walkPublicImages(fullPath));
      continue;
    }

    if (PUBLIC_IMAGE_EXTENSIONS.test(entry.name)) {
      violations.push(fullPath);
    }
  }

  return violations;
};

const publicImageViolations = walkPublicImages(PUBLIC_DIR).filter((file) => !file.startsWith(path.join(PUBLIC_DIR, 'generated')));

if (publicImageViolations.length) {
  console.error('[image-budget] Source images must not be served from public/. Move them under assets/gallery-source/.');
  for (const file of publicImageViolations) {
    console.error(`[image-budget] unexpected public image: ${file}`);
  }
  process.exit(1);
}

const files = readdirSync(GENERATED_IMAGES_DIR)
  .filter((file) => /\.(webp|jpe?g)$/i.test(file))
  .sort()
  .map((file) => path.join(GENERATED_IMAGES_DIR, file));

if (!files.length) {
  console.error(`[image-budget] No generated gallery files found in ${GENERATED_IMAGES_DIR}. Run npm run images:generate first.`);
  process.exit(1);
}

const entries = files.map((file) => {
  const size = statSync(file).size;
  return { file, size };
});

const totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);

const resolveGeneratedFile = (fileName) => {
  const filePath = path.join(GENERATED_IMAGES_DIR, fileName);

  if (!existsSync(filePath)) {
    console.error(`[image-budget] Missing generated gallery asset ${filePath}`);
    process.exit(1);
  }

  return filePath;
};

const criticalEntries = CRITICAL_IMAGES.map((fileBase) => {
  const preferredWebpPath = path.join(GENERATED_IMAGES_DIR, `${fileBase}-main.webp`);
  const fallbackJpegPath = path.join(GENERATED_IMAGES_DIR, `${fileBase}-main.jpeg`);

  return {
    file: existsSync(preferredWebpPath) ? preferredWebpPath : resolveGeneratedFile(`${fileBase}-main.jpeg`),
    size: existsSync(preferredWebpPath) ? statSync(preferredWebpPath).size : statSync(fallbackJpegPath).size
  };
});

const criticalTotalBytes = criticalEntries.reduce((sum, entry) => sum + entry.size, 0);
const oversizedMain = entries.filter((entry) => /-main\.(webp|jpe?g)$/i.test(entry.file) && entry.size > MAX_SINGLE_MAIN_BYTES);
const oversizedThumb = entries.filter((entry) => /-thumb\.(webp|jpe?g)$/i.test(entry.file) && entry.size > MAX_SINGLE_THUMB_BYTES);

for (const entry of entries.slice().sort((a, b) => b.size - a.size).slice(0, 5)) {
  console.log(`[image-budget] ${path.basename(entry.file)} ${(entry.size / 1024).toFixed(1)} KB`);
}

console.log(`[image-budget] generated gallery total ${(totalBytes / 1024).toFixed(1)} KB`);
console.log(`[image-budget] critical eager main set ${(criticalTotalBytes / 1024).toFixed(1)} KB`);

if (criticalTotalBytes > MAX_CRITICAL_TOTAL_BYTES) {
  console.error(
    `[image-budget] Critical eager gallery budget exceeded: ${(criticalTotalBytes / 1024).toFixed(1)} KB > ${(MAX_CRITICAL_TOTAL_BYTES / 1024).toFixed(1)} KB`
  );
  process.exit(1);
}

if (oversizedMain.length) {
  for (const entry of oversizedMain) {
    console.error(
      `[image-budget] ${path.basename(entry.file)} exceeded main-image budget: ${(entry.size / 1024).toFixed(1)} KB > ${(MAX_SINGLE_MAIN_BYTES / 1024).toFixed(1)} KB`
    );
  }
  process.exit(1);
}

if (oversizedThumb.length) {
  for (const entry of oversizedThumb) {
    console.error(
      `[image-budget] ${path.basename(entry.file)} exceeded thumbnail budget: ${(entry.size / 1024).toFixed(1)} KB > ${(MAX_SINGLE_THUMB_BYTES / 1024).toFixed(1)} KB`
    );
  }
  process.exit(1);
}

console.log('[image-budget] passed');
