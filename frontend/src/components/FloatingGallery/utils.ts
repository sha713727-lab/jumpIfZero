import type {
  CurveSample,
  GalleryLayoutConfig,
  GalleryViewport,
  RibbonPathVariant,
} from "./types";

export const GALLERY_SEED = 0x4a5a4552;

export const GALLERY_DESKTOP: GalleryLayoutConfig = {
  itemCount: 72,
  scrollDistance: 5000,
  floatAmplitude: 4,
  pathTravel: 0.5,
  minScale: 0.97,
  maxScale: 1.03,
  ribbonLanes: 1,
  laneSpread: 0,
  spreadX: 2.05,
  spreadY: 2.05,
  pathVariant: "landscape",
};

export const GALLERY_TABLET: GalleryLayoutConfig = {
  itemCount: 52,
  scrollDistance: 4200,
  floatAmplitude: 3,
  pathTravel: 0.44,
  minScale: 0.86,
  maxScale: 0.92,
  ribbonLanes: 1,
  laneSpread: 0,
  spreadX: 1.05,
  spreadY: 1.8,
  pathVariant: "portrait",
};

export const GALLERY_MOBILE: GalleryLayoutConfig = {
  itemCount: 36,
  scrollDistance: 3200,
  floatAmplitude: 2,
  pathTravel: 0.38,
  minScale: 0.72,
  maxScale: 0.78,
  ribbonLanes: 1,
  laneSpread: 0,
  spreadX: 0.7,
  spreadY: 1.62,
  pathVariant: "portrait",
};

export const GALLERY_BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
} as const;

type PathPoint = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

const RIBBON_POINTS_LANDSCAPE: readonly PathPoint[] = [
  { x: 1.071, y: -0.9, z: -1.05 },
  { x: 0.59, y: -0.629, z: -0.85 },
  { x: 0.145, y: -0.436, z: -0.68 },
  { x: -0.273, y: -0.286, z: -0.55 },
  { x: -0.549, y: -0.142, z: -0.45 },
  { x: -0.585, y: 0.032, z: -0.42 },
  { x: -0.338, y: 0.123, z: -0.36 },
  { x: 0.03, y: 0.166, z: -0.3 },
  { x: 0.359, y: 0.197, z: -0.26 },
  { x: 0.537, y: 0.263, z: -0.24 },
  { x: 0.502, y: 0.402, z: -0.24 },
  { x: 0.243, y: 0.476, z: -0.2 },
  { x: -0.078, y: 0.523, z: -0.16 },
  { x: -0.438, y: 0.593, z: -0.14 },
  { x: -0.742, y: 0.653, z: -0.3 },
  { x: -0.863, y: -0.398, z: -0.5 },
  { x: -0.231, y: -1.038, z: -0.8 },
  { x: 0.657, y: -1.067, z: -0.95 },
] as const;

const RIBBON_POINTS_PORTRAIT: readonly PathPoint[] = [
  { x: 1.02, y: -0.94, z: -1 },
  { x: 0.62, y: -0.66, z: -0.85 },
  { x: 0.16, y: -0.47, z: -0.7 },
  { x: -0.3, y: -0.3, z: -0.56 },
  { x: -0.58, y: -0.14, z: -0.46 },
  { x: -0.6, y: 0.04, z: -0.42 },
  { x: -0.34, y: 0.14, z: -0.36 },
  { x: 0.04, y: 0.19, z: -0.3 },
  { x: 0.38, y: 0.22, z: -0.26 },
  { x: 0.56, y: 0.3, z: -0.24 },
  { x: 0.52, y: 0.44, z: -0.23 },
  { x: 0.24, y: 0.52, z: -0.2 },
  { x: -0.09, y: 0.58, z: -0.17 },
  { x: -0.46, y: 0.66, z: -0.15 },
  { x: -2.35, y: 0.74, z: -0.4 },
  { x: -2.95, y: -0.3, z: -0.65 },
  { x: -1.1, y: -1.6, z: -0.9 },
  { x: 0.75, y: -1.5, z: -1.02 },
] as const;

const CENTRIPETAL_ALPHA = 0.5;

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function wrap01(value: number): number {
  return ((value % 1) + 1) % 1;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) {
    return outMin;
  }

  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function randomInRange(
  random: () => number,
  min: number,
  max: number,
): number {
  return lerp(min, max, random());
}

export function resolveViewport(width: number, height: number): GalleryViewport {
  return {
    width,
    height,
    isMobile: width <= GALLERY_BREAKPOINTS.mobileMax,
    isTablet:
      width > GALLERY_BREAKPOINTS.mobileMax &&
      width <= GALLERY_BREAKPOINTS.tabletMax,
  };
}

export function resolveLayoutConfig(
  viewport: GalleryViewport,
): GalleryLayoutConfig {
  if (viewport.isMobile) {
    return GALLERY_MOBILE;
  }

  if (viewport.isTablet) {
    return GALLERY_TABLET;
  }

  return GALLERY_DESKTOP;
}

function knotDistance(from: PathPoint, to: PathPoint): number {
  const squared =
    (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + (to.z - from.z) ** 2;
  return Math.max(squared ** (CENTRIPETAL_ALPHA / 2), 1e-5);
}

function blend(
  from: PathPoint,
  to: PathPoint,
  fromKnot: number,
  toKnot: number,
  knot: number,
): PathPoint {
  const span = toKnot - fromKnot;
  const weight = (knot - fromKnot) / span;
  const inverse = 1 - weight;

  return {
    x: inverse * from.x + weight * to.x,
    y: inverse * from.y + weight * to.y,
    z: inverse * from.z + weight * to.z,
  };
}

function samplePathNormalized(
  points: readonly PathPoint[],
  tRaw: number,
): PathPoint {
  const segments = points.length;
  const scaled = wrap01(tRaw) * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  const local = scaled - index;

  const p0 = points[(index - 1 + segments) % segments];
  const p1 = points[index];
  const p2 = points[(index + 1) % segments];
  const p3 = points[(index + 2) % segments];

  if (!p0 || !p1 || !p2 || !p3) {
    return { x: 0, y: 0, z: -0.5 };
  }

  const k0 = 0;
  const k1 = k0 + knotDistance(p0, p1);
  const k2 = k1 + knotDistance(p1, p2);
  const k3 = k2 + knotDistance(p2, p3);
  const knot = lerp(k1, k2, local);

  const a1 = blend(p0, p1, k0, k1, knot);
  const a2 = blend(p1, p2, k1, k2, knot);
  const a3 = blend(p2, p3, k2, k3, knot);
  const b1 = blend(a1, a2, k0, k2, knot);
  const b2 = blend(a2, a3, k1, k3, knot);

  return blend(b1, b2, k1, k2, knot);
}

const ARC_SAMPLES = 512;
const ARC_VERTICAL_WEIGHT = 0.56;
const ARC_DEPTH_WEIGHT = 0.56;

type RibbonPath = {
  readonly points: readonly PathPoint[];
  readonly lengths: Float64Array;
  readonly total: number;
};

function createRibbonPath(points: readonly PathPoint[]): RibbonPath {
  const lengths = new Float64Array(ARC_SAMPLES + 1);
  let previous = samplePathNormalized(points, 0);
  let total = 0;

  for (let index = 1; index <= ARC_SAMPLES; index += 1) {
    const point = samplePathNormalized(points, index / ARC_SAMPLES);
    total += Math.hypot(
      point.x - previous.x,
      (point.y - previous.y) * ARC_VERTICAL_WEIGHT,
      (point.z - previous.z) * ARC_DEPTH_WEIGHT,
    );
    lengths[index] = total;
    previous = point;
  }

  return { points, lengths, total: total || 1 };
}

const RIBBON_PATHS: Record<RibbonPathVariant, RibbonPath> = {
  landscape: createRibbonPath(RIBBON_POINTS_LANDSCAPE),
  portrait: createRibbonPath(RIBBON_POINTS_PORTRAIT),
};

function arcToCurveT(path: RibbonPath, uRaw: number): number {
  const target = clamp(uRaw, 0, 1) * path.total;
  const { lengths } = path;

  let low = 0;
  let high = ARC_SAMPLES;

  while (low < high) {
    const mid = (low + high) >> 1;
    if ((lengths[mid] ?? 0) < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  const upper = Math.max(low, 1);
  const startLength = lengths[upper - 1] ?? 0;
  const endLength = lengths[upper] ?? startLength;
  const segment = endLength - startLength || 1;

  return (upper - 1 + (target - startLength) / segment) / ARC_SAMPLES;
}

export function sampleRibbon(
  uRaw: number,
  width: number,
  height: number,
  lane: number,
  config: GalleryLayoutConfig,
): CurveSample {
  const u = wrap01(uRaw);
  const epsilon = 0.006;
  const path = RIBBON_PATHS[config.pathVariant];
  const current = samplePathNormalized(path.points, arcToCurveT(path, u));
  const next = samplePathNormalized(
    path.points,
    arcToCurveT(path, wrap01(u + epsilon)),
  );

  const w = width * 0.5;
  const h = height * 0.5;
  const depth = Math.min(width, height);

  const dx = next.x - current.x;
  const dy = next.y - current.y;
  const dz = next.z - current.z;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;

  const laneOffset =
    config.ribbonLanes <= 1
      ? 0
      : (lane - (config.ribbonLanes - 1) / 2) * config.laneSpread;

  const z = current.z * depth;

  const x = current.x * w * config.spreadX + nx * laneOffset;
  const y = current.y * h * config.spreadY + ny * laneOffset;

  const tangentYaw = (Math.atan2(dx, dz) * 180) / Math.PI;
  const tangentPitch =
    (Math.atan2(dy, Math.hypot(dx, dz) || 0.0001) * 180) / Math.PI;

  return {
    x,
    y,
    z,
    depthRatio: current.z,
    rotateX: clamp(tangentPitch * -0.5, -14, 14),
    rotateY: clamp(tangentYaw * 0.68, -70, 70),
    rotateZ: clamp(tangentPitch * 0.4, -12, 12),
  };
}

export function depthScale(depthRatio: number): number {
  return clamp(mapRange(depthRatio, -0.97, -0.09, 0.92, 1.1), 0.9, 1.12);
}

export function ribbonOpacity(depthRatio: number): number {
  return clamp(mapRange(depthRatio, -0.97, -0.09, 0.44, 0.9), 0.4, 0.92);
}
