import { AppBannerConfig } from '../types';

const toNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const totalFromEnv = toNumber(import.meta.env.VITE_TOTAL_STUDENTS);
export const TOTAL_STUDENTS = totalFromEnv ?? 29;
export const GHOST_STUDENT_HAKBUN = '1115';
export const SPECIAL_STUDENTS = ['장세혁', '조현수', '조경윤'];

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

const defaultGalleryImages = [
  'images/eb1.jpeg',
  'images/eb2.jpeg',
  'images/eb3.jpeg',
  'images/eb4.jpeg',
  'images/eb5.jpeg',
  'images/eb6.jpeg',
  'images/eb7.jpeg',
  'images/eb8.jpeg',
  'images/eb9.jpeg',
  'images/eb10.jpeg',
  'images/eb11.jpeg',
  'images/eb12.jpeg',
  'images/eb13.jpeg',
  'images/eb14.jpeg',
  'images/eb15.jpeg',
  'images/eb16.jpeg',
  'images/eb17.jpeg',
  'images/eb18.jpeg',
  'images/eb19.jpeg',
  'images/eb20.jpeg',
  'images/eb21.jpeg',
].map((src) => normalizeImageSrc(src));

const galleryImagesFromEnv = import.meta.env.VITE_GALLERY_IMAGES
  ?.split(',')
  .map((src: string) => normalizeImageSrc(src))
  .filter(Boolean);

export const galleryImages = galleryImagesFromEnv && galleryImagesFromEnv.length ? galleryImagesFromEnv : defaultGalleryImages;
const galleryIntervalFromEnv = toNumber(import.meta.env.VITE_GALLERY_INTERVAL_MS);
export const galleryIntervalMs = galleryIntervalFromEnv ?? 12000;

export const bannerConfig: AppBannerConfig = {
  headline: bannerHeadline,
  subline: bannerSubline
};

