import type { PointValue } from './game';

type Creature = { name: string; element: string; cls: string; sheet: string; panel: 0 | 1 | 2; positionY?: string; stars: 1 | 2 | 3 | 4 | 5 };

// Map by point value so each card keeps its creature everywhere it appears.
export const CREATURES: Record<PointValue, Creature> = {
  '0,5': { name: 'Mossling', element: 'NATUUR', cls: 'nature', sheet: '/art/creatures-starters.png', panel: 0, stars: 1, positionY: '50%' },
  '1': { name: 'Astral Hatchling', element: 'ARCAAN', cls: 'arcane', sheet: '/art/creatures-starters.png', panel: 1, stars: 1, positionY: '50%' },
  '2': { name: 'Ember Newt', element: 'VUUR', cls: 'fire', sheet: '/art/creatures-starters.png', panel: 2, stars: 2, positionY: '50%' },
  '3': { name: 'Frostfang Wolf', element: 'IJS', cls: 'frost', sheet: '/art/creatures-elements.png', panel: 0, stars: 2 },
  '5': { name: 'Solar Sovereign', element: 'LICHT', cls: 'solar', sheet: '/art/creatures-elements.png', panel: 1, stars: 3 },
  '8': { name: 'Abyssal Kraken', element: 'OCEAAN', cls: 'ocean', sheet: '/art/creatures-elements.png', panel: 2, stars: 3 },
  '13': { name: 'Obsidian Colossus', element: 'MAGMA', cls: 'magma', sheet: '/art/creatures-titans.png', panel: 0, positionY: '0%', stars: 4 },
  '20': { name: 'Tempest Griffin', element: 'STORM', cls: 'storm', sheet: '/art/creatures-titans.png', panel: 1, stars: 4 },
  '40': { name: 'Cosmic Hydra', element: 'KOSMOS', cls: 'cosmic', sheet: '/art/creatures-titans.png', panel: 2, positionY: '0%', stars: 5 },
};
