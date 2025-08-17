import { Card, Face, Floor, BAIT_FACES, PREDATOR_NAMES } from './rules';

// 층별 카드 개수 정의
const FLOOR_CARD_COUNTS = {
  1: 6, // 먹이 6장
  2: 5, // 먹이 5장
  3: 4, // 먹이 4장
  4: 3, // 물고기 3장
  5: 2, // 포식자 2장
  6: 1  // 포식자 1장
} as const;

// 포식자-먹이 매핑 생성
export function createPredatorBaitMapping(): Record<string, Face> {
  const mapping: Record<string, Face> = {};
  const shuffledBaits = [...BAIT_FACES].sort(() => Math.random() - 0.5);
  
  PREDATOR_NAMES.forEach((predator, index) => {
    mapping[predator] = shuffledBaits[index % shuffledBaits.length];
  });
  
  return mapping;
}

// 먹이 카드 생성 (1-3층)
function createBaitCards(count: number): Card[] {
  const cards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomBait = BAIT_FACES[Math.floor(Math.random() * BAIT_FACES.length)];
    cards.push({
      id: `bait-${Date.now()}-${i}`,
      type: 'bait',
      mark: randomBait
    });
  }
  
  return cards;
}

// 물고기 카드 생성 (4층)
function createFishCards(count: number): Card[] {
  const cards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    cards.push({
      id: `fish-${Date.now()}-${i}`,
      type: 'fish'
    });
  }
  
  return cards;
}

// 포식자 카드 생성 (5-6층)
function createPredatorCards(count: number): Card[] {
  const cards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomPredator = PREDATOR_NAMES[Math.floor(Math.random() * PREDATOR_NAMES.length)];
    cards.push({
      id: `predator-${Date.now()}-${i}`,
      type: 'predator',
      predator: randomPredator,
      eaten: false
    });
  }
  
  return cards;
}

// 특정 층의 덱 생성
export function createFloorDeck(level: 1 | 2 | 3 | 4 | 5 | 6): Floor {
  const cardCount = FLOOR_CARD_COUNTS[level];
  let cards: Card[] = [];
  
  switch (level) {
    case 1:
    case 2:
    case 3:
      cards = createBaitCards(cardCount);
      break;
    case 4:
      cards = createFishCards(cardCount);
      break;
    case 5:
    case 6:
      cards = createPredatorCards(cardCount);
      break;
  }
  
  return {
    level,
    cards
  };
}

// 모든 층의 덱 생성
export function createAllFloorDecks(): Floor[] {
  const floors: Floor[] = [];
  
  for (let level = 1; level <= 6; level++) {
    floors.push(createFloorDeck(level as 1 | 2 | 3 | 4 | 5 | 6));
  }
  
  return floors;
}

// 카드를 덱에서 제거
export function removeCardFromFloor(floor: Floor, cardId: string): Floor {
  return {
    ...floor,
    cards: floor.cards.filter(card => card.id !== cardId)
  };
}

// 특정 마크의 카드가 있는지 확인
export function hasCardWithMark(floor: Floor, mark: Face): boolean {
  return floor.cards.some(card => card.mark === mark);
}

// 특정 마크의 첫 번째 카드 가져오기
export function getFirstCardWithMark(floor: Floor, mark: Face): Card | null {
  return floor.cards.find(card => card.mark === mark) || null;
}
