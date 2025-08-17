import { Face } from '../game/rules';

// 다이스 면 이모지 매핑
export const DICE_FACE_EMOJIS: Record<Face, string> = {
  shark: '🦈',
  diver: '🤿',
  crab: '🦀',
  seaweed: '🌿',
  fish: '🐟',
  clam: '🐚'
};

// 다이스 면 한글 이름
export const DICE_FACE_NAMES: Record<Face, string> = {
  shark: '상어',
  diver: '잠수부',
  crab: '꽃게',
  seaweed: '미역',
  fish: '물고기',
  clam: '조개'
};

// 이모지와 이름을 함께 반환
export function getDiceFaceDisplay(face: Face): string {
  return `${DICE_FACE_EMOJIS[face]} ${DICE_FACE_NAMES[face]}`;
}

// 카드 타입별 색상 클래스
export const CARD_TYPE_COLORS = {
  bait: 'card-bait',
  fish: 'card-fish',
  predator: 'card-predator'
} as const;
