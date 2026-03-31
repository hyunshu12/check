import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'assets', 'gallery-source');
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'generated', 'gallery');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'generated', 'galleryManifest.ts');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PUBLIC_IMAGE_EXTENSIONS = /\.(avif|webp|png|jpe?g)$/i;
const SOURCE_IMAGE_EXTENSIONS = /\.(jpe?g|png)$/i;

const MAIN_MAX_EDGE = 1600;
const THUMB_MAX_EDGE = 240;
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 82;

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

const fail = (message) => {
  console.error(`[gallery-generate] ${message}`);
  process.exit(1);
};

const averageChannelMetric = (stats, field) => {
  const channels = stats.channels.slice(0, 3);
  return channels.reduce((sum, channel) => sum + channel[field], 0) / channels.length;
};

const assertNotBlackCollapsed = (id, label, sourceStats, outputStats) => {
  const sourceMean = averageChannelMetric(sourceStats, 'mean');
  const sourceDeviation = averageChannelMetric(sourceStats, 'stdev');
  const outputMean = averageChannelMetric(outputStats, 'mean');
  const outputDeviation = averageChannelMetric(outputStats, 'stdev');

  const looksNearBlack = outputMean < 12 && outputDeviation < 8;
  const sourceHadRealSignal = sourceMean > 24 && sourceDeviation > 12;
  const collapsedRelativeToSource =
    outputMean / Math.max(sourceMean, 1) < 0.35 &&
    outputDeviation / Math.max(sourceDeviation, 1) < 0.35;

  if (looksNearBlack && sourceHadRealSignal && collapsedRelativeToSource) {
    fail(
      `${id} ${label} output looks incorrectly collapsed. ` +
        `source mean/stdev=${sourceMean.toFixed(1)}/${sourceDeviation.toFixed(1)}, ` +
        `output mean/stdev=${outputMean.toFixed(1)}/${outputDeviation.toFixed(1)}`
    );
  }
};

const listPublicImageViolations = (dir) => {
  const violations = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      violations.push(...listPublicImageViolations(absolutePath));
      continue;
    }

    if (PUBLIC_IMAGE_EXTENSIONS.test(entry.name)) {
      violations.push(path.relative(ROOT_DIR, absolutePath));
    }
  }

  return violations;
};

const publicViolations = listPublicImageViolations(PUBLIC_DIR).filter((file) => !file.startsWith('public/generated/'));

if (publicViolations.length) {
  fail(
    `original images must not remain in public/. Move them under assets/gallery-source/. Found: ${publicViolations.join(', ')}`
  );
}

const sourceFiles = readdirSync(SOURCE_DIR)
  .filter((file) => SOURCE_IMAGE_EXTENSIONS.test(file))
  .sort(collator.compare);

if (!sourceFiles.length) {
  fail(`no gallery source images found in ${path.relative(ROOT_DIR, SOURCE_DIR)}`);
}

rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

const manifestEntries = [];

for (const fileName of sourceFiles) {
  const sourcePath = path.join(SOURCE_DIR, fileName);
  const id = path.basename(fileName, path.extname(fileName));
  const sourcePipeline = sharp(sourcePath).rotate().toColorspace('srgb');
  const sourceStats = await sourcePipeline.clone().stats();

  const mainBase = sourcePipeline.clone().resize({
    width: MAIN_MAX_EDGE,
    height: MAIN_MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true
  });
  const thumbBase = sourcePipeline.clone().resize({
    width: THUMB_MAX_EDGE,
    height: THUMB_MAX_EDGE,
    fit: 'inside',
    withoutEnlargement: true
  });

  const mainWebpPath = path.join(OUTPUT_DIR, `${id}-main.webp`);
  const mainJpegPath = path.join(OUTPUT_DIR, `${id}-main.jpeg`);
  const thumbWebpPath = path.join(OUTPUT_DIR, `${id}-thumb.webp`);
  const thumbJpegPath = path.join(OUTPUT_DIR, `${id}-thumb.jpeg`);

  const mainWebpInfo = await mainBase
    .clone()
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(mainWebpPath);
  const mainJpegInfo = await mainBase
    .clone()
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toFile(mainJpegPath);
  const thumbWebpInfo = await thumbBase
    .clone()
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(thumbWebpPath);
  const thumbJpegInfo = await thumbBase
    .clone()
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toFile(thumbJpegPath);

  assertNotBlackCollapsed(id, 'main jpeg', sourceStats, await sharp(mainJpegPath).stats());
  assertNotBlackCollapsed(id, 'thumb jpeg', sourceStats, await sharp(thumbJpegPath).stats());

  manifestEntries.push({
    id,
    main: {
      webpImport: `${id}MainWebp`,
      jpegImport: `${id}MainJpeg`,
      width: mainJpegInfo.width,
      height: mainJpegInfo.height
    },
    thumb: {
      webpImport: `${id}ThumbWebp`,
      jpegImport: `${id}ThumbJpeg`,
      width: thumbJpegInfo.width,
      height: thumbJpegInfo.height
    }
  });

  console.log(
    `[gallery-generate] ${id} main ${mainJpegInfo.width}x${mainJpegInfo.height} ` +
      `${(statSync(mainWebpPath).size / 1024).toFixed(1)} KB(webp) / ${(statSync(mainJpegPath).size / 1024).toFixed(1)} KB(jpeg), ` +
      `thumb ${(statSync(thumbWebpPath).size / 1024).toFixed(1)} KB(webp) / ${(statSync(thumbJpegPath).size / 1024).toFixed(1)} KB(jpeg)`
  );
}

const importLines = [];
const assetBlocks = [];

for (const entry of manifestEntries) {
  importLines.push(`import ${entry.main.webpImport} from './gallery/${entry.id}-main.webp';`);
  importLines.push(`import ${entry.main.jpegImport} from './gallery/${entry.id}-main.jpeg';`);
  importLines.push(`import ${entry.thumb.webpImport} from './gallery/${entry.id}-thumb.webp';`);
  importLines.push(`import ${entry.thumb.jpegImport} from './gallery/${entry.id}-thumb.jpeg';`);

  assetBlocks.push(`  {
    id: '${entry.id}',
    main: { webpSrc: ${entry.main.webpImport}, jpegSrc: ${entry.main.jpegImport}, width: ${entry.main.width}, height: ${entry.main.height} },
    thumb: { webpSrc: ${entry.thumb.webpImport}, jpegSrc: ${entry.thumb.jpegImport}, width: ${entry.thumb.width}, height: ${entry.thumb.height} }
  }`);
}

const manifestContents = `/* eslint-disable */
// This file is generated by scripts/generate-gallery-assets.mjs.
// Do not edit manually.

import type { GalleryImageAsset } from '../types';
${importLines.join('\n')}

export const generatedGalleryAssets: GalleryImageAsset[] = [
${assetBlocks.join(',\n')}
];
`;

mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
writeFileSync(MANIFEST_PATH, manifestContents);

console.log(`[gallery-generate] wrote ${path.relative(ROOT_DIR, MANIFEST_PATH)} for ${manifestEntries.length} assets`);
