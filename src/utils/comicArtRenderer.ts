// Procedural dynamic comic art renderer & export helper
// Generates comic-themed background patterns, speedlines, bursts, and gradients

export function getComicPatternStyle(sceneTitle: string, visualStyle: string, index: number): {
  bgGradient: string;
  burstColor: string;
  accentColor: string;
  patternType: 'speedlines' | 'burst' | 'dots' | 'grid' | 'city';
} {
  const paletteIndex = index % 5;
  const palettes = [
    {
      bgGradient: 'from-amber-200 via-yellow-300 to-orange-400',
      burstColor: '#fef08a',
      accentColor: '#dc2626',
      patternType: 'burst' as const,
    },
    {
      bgGradient: 'from-sky-300 via-blue-500 to-indigo-700',
      burstColor: '#7dd3fc',
      accentColor: '#0284c7',
      patternType: 'speedlines' as const,
    },
    {
      bgGradient: 'from-fuchsia-400 via-purple-600 to-indigo-900',
      burstColor: '#f0abfc',
      accentColor: '#9333ea',
      patternType: 'dots' as const,
    },
    {
      bgGradient: 'from-emerald-300 via-teal-500 to-cyan-800',
      burstColor: '#a7f3d0',
      accentColor: '#059669',
      patternType: 'grid' as const,
    },
    {
      bgGradient: 'from-rose-400 via-red-500 to-amber-600',
      burstColor: '#fecdd3',
      accentColor: '#b91c1c',
      patternType: 'city' as const,
    },
  ];

  if (visualStyle.includes('Noir')) {
    return {
      bgGradient: 'from-slate-700 via-slate-800 to-black',
      burstColor: '#ffffff',
      accentColor: '#cbd5e1',
      patternType: 'speedlines',
    };
  }

  if (visualStyle.includes('Vintage')) {
    return {
      bgGradient: 'from-amber-100 via-amber-200 to-yellow-600',
      burstColor: '#fef3c7',
      accentColor: '#b45309',
      patternType: 'dots',
    };
  }

  return palettes[paletteIndex];
}

// Generate SVG string for comic art backdrop
export function generateComicBackdropSvg(
  title: string,
  sceneDescription: string,
  cameraAngle: string,
  styleName: string,
  index: number
): string {
  const { burstColor, accentColor, patternType } = getComicPatternStyle(title, styleName, index);

  // SVG burst ray paths
  const rays = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const x2 = 250 + Math.cos(rad) * 350;
    const y2 = 200 + Math.sin(rad) * 350;
    return `<polygon points="250,200 ${x2},${y2} ${x2 + 25},${y2 + 25}" fill="${burstColor}" opacity="0.25" />`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%" class="w-full h-full select-none">
      <defs>
        <radialGradient id="comicGlow-${index}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${burstColor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.95"/>
        </radialGradient>
        <pattern id="halftone-${index}" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.2" fill="#000000" opacity="0.12"/>
        </pattern>
      </defs>
      
      <rect width="500" height="400" fill="url(#comicGlow-${index})" />
      
      <!-- Dynamic comic rays -->
      <g>${rays}</g>
      
      <!-- Halftone overlay -->
      <rect width="500" height="400" fill="url(#halftone-${index})" />
      
      <!-- Comic horizon / ground baseline -->
      <path d="M0,320 Q250,300 500,320 L500,400 L0,400 Z" fill="#000000" opacity="0.15" />
      
      <!-- Comic graphic focus circle -->
      <circle cx="250" cy="180" r="90" fill="${burstColor}" stroke="#000000" stroke-width="4" stroke-dasharray="6 4" opacity="0.4" />
      
      <!-- Action speed lines -->
      <line x1="20" y1="20" x2="160" y2="120" stroke="#ffffff" stroke-width="3" opacity="0.4"/>
      <line x1="480" y1="20" x2="340" y2="120" stroke="#ffffff" stroke-width="3" opacity="0.4"/>
      <line x1="20" y1="380" x2="160" y2="280" stroke="#ffffff" stroke-width="3" opacity="0.4"/>
      <line x1="480" y1="380" x2="340" y2="280" stroke="#ffffff" stroke-width="3" opacity="0.4"/>
    </svg>
  `;
}
