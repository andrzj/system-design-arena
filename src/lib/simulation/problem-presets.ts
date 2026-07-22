export type ProblemSimPreset = {
  readRatio: number;
  cacheHitRate: number;
  label: string;
  hint: string;
  focus: string;
  resolution: string;
};

function preset(
  readRatio: number,
  hint: string,
  focus: string,
  resolution: string,
  cacheHitRate: number,
): ProblemSimPreset {
  const profile =
    readRatio >= 0.8 ? 'Read-heavy' : readRatio <= 0.4 ? 'Write-heavy' : 'Balanced';
  return {
    readRatio,
    cacheHitRate,
    label: profile,
    hint,
    focus,
    resolution,
  };
}

const PROBLEM_PRESETS: Record<string, ProblemSimPreset> = {
  'Design a URL Shortener': preset(
    0.92,
    'Reads (redirects) vastly outnumber writes (new links). Caching the link map is a huge win.',
    'Hot read path',
    'Cache popular short-code mappings before the database.',
    0.95,
  ),
  'Build a Hotel Booking Page': preset(
    0.85,
    'Browsing and availability checks dominate; bookings are comparatively rare writes.',
    'Read-heavy browse path',
    'Cache repeated room and availability reads.',
    0.8,
  ),
  'Design Twitter/X Feed': preset(
    0.88,
    'Timeline reads dominate, while tweet writes need async fan-out so posting does not block.',
    'Timeline reads + fan-out',
    'Cache home timelines, then queue fan-out-on-write.',
    0.7,
  ),
  'How Uber Finds Nearby Drivers at 1 Million RPS': preset(
    0.72,
    'Nearby-driver lookups dominate visible load, while GPS pings require buffered ingestion.',
    'Geo reads + GPS ingestion',
    'Serve lookups from regional cache; buffer location writes.',
    0.65,
  ),
};

export function getProblemSimPreset(problemTitle: string | undefined): ProblemSimPreset | null {
  if (!problemTitle) return null;
  return PROBLEM_PRESETS[problemTitle] ?? null;
}

export function profileLabelForReadRatio(readRatio: number): string {
  if (readRatio >= 0.8) return 'Read-heavy';
  if (readRatio <= 0.4) return 'Write-heavy';
  return 'Balanced';
}
