import { generatedGalleryAssets } from '../generated/galleryManifest';
import { AppBannerConfig, GalleryImageAsset } from '../types';

const toNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const totalFromEnv = toNumber(import.meta.env.VITE_TOTAL_STUDENTS);
export const TOTAL_STUDENTS = totalFromEnv;

const bannerHeadline = import.meta.env.VITE_BANNER_HEADLINE ?? '넌 충분히 잘하고 있어.';
const bannerSubline = import.meta.env.VITE_BANNER_SUBLINE ?? '오늘의 응원';

const baseUrl = import.meta.env.BASE_URL ?? '/';

const resolveWithBase = (path: string) => {
  if (!path) return '';

  // If the path already begins with the base URL (for non-root deployments), respect it as-is.
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const baseIsRoot = !normalizedBase || normalizedBase === '' || normalizedBase === '/';

  if (!baseIsRoot && path.startsWith(normalizedBase)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (baseIsRoot) {
    return `/${normalizedPath}`;
  }

  return `${normalizedBase}/${normalizedPath}`;
};

const stripToPublicRoot = (path: string) => {
  const normalized = path.replace(/\\/g, '/');
  const marker = '/public/';
  const index = normalized.indexOf(marker);
  if (index === -1) return path;
  return normalized.slice(index + marker.length);
};

const normalizeImageSrc = (src: string) => {
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) return trimmed;

  const fromPublicRoot = stripToPublicRoot(trimmed);
  const relativePath = fromPublicRoot.replace(/^public\//, '');
  return resolveWithBase(relativePath);
};

const OVERRIDE_MAIN_WIDTH = 1600;
const OVERRIDE_MAIN_HEIGHT = 900;
const OVERRIDE_THUMB_WIDTH = 240;
const OVERRIDE_THUMB_HEIGHT = 135;

const toOverrideGalleryAsset = (src: string, index: number): GalleryImageAsset => ({
  id: `override-${index + 1}`,
  main: {
    jpegSrc: src,
    width: OVERRIDE_MAIN_WIDTH,
    height: OVERRIDE_MAIN_HEIGHT
  },
  thumb: {
    jpegSrc: src,
    width: OVERRIDE_THUMB_WIDTH,
    height: OVERRIDE_THUMB_HEIGHT
  }
});

const galleryImagesFromEnv = import.meta.env.VITE_GALLERY_IMAGES
  ?.split(',')
  .map((src: string) => normalizeImageSrc(src))
  .filter(Boolean)
  .map((src: string, index: number) => toOverrideGalleryAsset(src, index));

export const galleryImages = galleryImagesFromEnv && galleryImagesFromEnv.length ? galleryImagesFromEnv : generatedGalleryAssets;
const galleryIntervalFromEnv = toNumber(import.meta.env.VITE_GALLERY_INTERVAL_MS);
export const galleryIntervalMs = galleryIntervalFromEnv ?? 12000;

export const bannerConfig: AppBannerConfig = {
  headline: bannerHeadline,
  subline: bannerSubline
};
