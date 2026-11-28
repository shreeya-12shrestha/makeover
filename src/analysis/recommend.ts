import type { Depth, Undertone } from './tone'

type Shade = { name: string; color: string }
type DepthGroup = 'fair' | 'medium' | 'deep'
type Palette = { lips: Shade[]; blush: Shade[]; eyeshadow: Shade[] }

export type Recommendation = Palette & { reason: string }

// Undertone + depth anusar shades ko table
const PALETTES: Record<Undertone, Record<DepthGroup, Palette>> = {
  warm: {
    fair: {
      lips: [
        { name: 'Peach Nude', color: '#c98b74' },
        { name: 'Coral', color: '#e06a55' },
        { name: 'Warm Pink', color: '#d46a6a' },
      ],
      blush: [
        { name: 'Peach', color: '#f0a383' },
        { name: 'Apricot', color: '#eb9a6e' },
      ],
      eyeshadow: [
        { name: 'Champagne Gold', color: '#d8b67a' },
        { name: 'Soft Bronze', color: '#b88a5a' },
      ],
    },
    medium: {
      lips: [
        { name: 'Coral Red', color: '#d9553f' },
        { name: 'Terracotta', color: '#b5563d' },
        { name: 'Caramel Nude', color: '#a8694f' },
      ],
      blush: [
        { name: 'Coral', color: '#e9725a' },
        { name: 'Warm Peach', color: '#e08a64' },
      ],
      eyeshadow: [
        { name: 'Bronze', color: '#9c6b3c' },
        { name: 'Copper', color: '#b0602f' },
        { name: 'Gold', color: '#c9a14a' },
      ],
    },
    deep: {
      lips: [
        { name: 'Brick Red', color: '#8f2f22' },
        { name: 'Rust', color: '#9b3b1f' },
        { name: 'Chocolate Nude', color: '#6e3b2a' },
      ],
      blush: [
        { name: 'Burnt Orange', color: '#c45a35' },
        { name: 'Deep Coral', color: '#cf5b45' },
      ],
      eyeshadow: [
        { name: 'Copper', color: '#a5552a' },
        { name: 'Deep Bronze', color: '#7a4a26' },
        { name: 'Gold', color: '#c09030' },
      ],
    },
  },
  cool: {
    fair: {
      lips: [
        { name: 'Rose Pink', color: '#c95a7a' },
        { name: 'Mauve', color: '#a86b7e' },
        { name: 'Blue Red', color: '#b3123a' },
      ],
      blush: [
        { name: 'Soft Pink', color: '#e88aa0' },
        { name: 'Rose', color: '#d46f88' },
      ],
      eyeshadow: [
        { name: 'Mauve', color: '#a07a90' },
        { name: 'Taupe', color: '#8a7a74' },
        { name: 'Lilac', color: '#a58bb3' },
      ],
    },
    medium: {
      lips: [
        { name: 'Berry', color: '#8e2a4e' },
        { name: 'Raspberry', color: '#b3264f' },
        { name: 'Mauve Rose', color: '#9c5568' },
      ],
      blush: [
        { name: 'Rose', color: '#c95b6e' },
        { name: 'Berry Pink', color: '#c4507a' },
      ],
      eyeshadow: [
        { name: 'Plum', color: '#6e3b5e' },
        { name: 'Mauve', color: '#8e5a73' },
        { name: 'Taupe', color: '#7a6a66' },
      ],
    },
    deep: {
      lips: [
        { name: 'Deep Berry', color: '#6a1b3a' },
        { name: 'Plum', color: '#5c1f3f' },
        { name: 'Wine', color: '#5a1428' },
      ],
      blush: [
        { name: 'Berry', color: '#a8476a' },
        { name: 'Plum Rose', color: '#8e3a5c' },
      ],
      eyeshadow: [
        { name: 'Deep Plum', color: '#4a2340' },
        { name: 'Smoky Grey', color: '#3b3438' },
        { name: 'Aubergine', color: '#4b2a45' },
      ],
    },
  },
  neutral: {
    fair: {
      lips: [
        { name: 'Dusty Rose', color: '#c07a7e' },
        { name: 'Soft Red', color: '#c0393f' },
        { name: 'Nude Pink', color: '#c99088' },
      ],
      blush: [
        { name: 'Peach Pink', color: '#ec9a92' },
        { name: 'Dusty Rose', color: '#d4848a' },
      ],
      eyeshadow: [
        { name: 'Champagne', color: '#d6c0a0' },
        { name: 'Soft Brown', color: '#9a7560' },
        { name: 'Taupe', color: '#8a7a74' },
      ],
    },
    medium: {
      lips: [
        { name: 'Rosewood', color: '#a5525a' },
        { name: 'Classic Red', color: '#b0102a' },
        { name: 'Mauve Nude', color: '#a06a68' },
      ],
      blush: [
        { name: 'Rose Peach', color: '#d97a78' },
        { name: 'Dusty Rose', color: '#c46e74' },
      ],
      eyeshadow: [
        { name: 'Warm Taupe', color: '#86705f' },
        { name: 'Brown', color: '#7a4a32' },
        { name: 'Rose Gold', color: '#b98270' },
      ],
    },
    deep: {
      lips: [
        { name: 'Deep Rosewood', color: '#7e3540' },
        { name: 'Cranberry', color: '#8a1f33' },
        { name: 'Cocoa Nude', color: '#6f4337' },
      ],
      blush: [
        { name: 'Mulberry', color: '#9a4558' },
        { name: 'Deep Rose', color: '#a84f5e' },
      ],
      eyeshadow: [
        { name: 'Chocolate', color: '#5a3626' },
        { name: 'Bronze', color: '#8a5a30' },
        { name: 'Plum Brown', color: '#5a3440' },
      ],
    },
  },
}

const REASONS: Record<Undertone, string> = {
  warm: 'Chhala ma sunaulo/pahelo tone cha. Coral, peach ra bronze jasta warm colours le natural glow dinchhan.',
  cool: 'Chhala ma gulaabi/raato tone cha. Berry, rose ra plum jasta cool colours le chhala lai fresh dekhaunchhan.',
  neutral: 'Chhala ma warm ra cool dubai tone milyeka chan. Dusty rose, taupe jasta narm colours sabai bhanda ramro milchhan.',
}

function depthGroup(depth: Depth): DepthGroup {
  if (depth === 'very light' || depth === 'light') return 'fair'
  if (depth === 'intermediate' || depth === 'tan') return 'medium'
  return 'deep'
}

export function recommendLook(depth: Depth, undertone: Undertone): Recommendation {
  return { ...PALETTES[undertone][depthGroup(depth)], reason: REASONS[undertone] }
}