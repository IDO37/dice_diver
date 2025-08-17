export type Face = 'shark' | 'diver' | 'crab' | 'seaweed' | 'fish' | 'clam';
export type CardType = 'bait' | 'fish' | 'predator';

export interface Card {
  id: string;
  type: CardType;
  mark?: Face;
  predator?: string;
  eaten?: boolean;
  fedScore?: number;
}

export interface Floor {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  cards: Card[];
}

export interface Rules {
  roundsTotal: number; // 10
  dicePerRound: number; // 6
  skipIfSharksGTE: number; // 3
  predatorFedScoreRange: [number, number]; // [8,12]
}

export interface PlayerState {
  round: number;
  depth: number;
  diceActive: number; // 현재 라운드 남은 주사위 개수
  removedThisRound: number; // 임시 제거 수
  inventory: {
    bait: Record<Face, number>;
    fish: number;
    predators: Card[];
  };
  log: string[];
  outcome?: 'running' | 'ended';
}

export const DEFAULT_RULES: Rules = {
  roundsTotal: 10,
  dicePerRound: 6,
  skipIfSharksGTE: 3,
  predatorFedScoreRange: [8, 12]
};

export const DICE_FACES: Face[] = ['shark', 'diver', 'crab', 'seaweed', 'fish', 'clam'];

export const BAIT_FACES: Face[] = ['crab', 'seaweed', 'fish', 'clam'];

export const PREDATOR_NAMES = ['상어', '문어', '거북이', '불가사리'];

// 주사위 굴리기
export function rollDice(count: number): Face[] {
  const result: Face[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * DICE_FACES.length);
    result.push(DICE_FACES[randomIndex]);
  }
  return result;
}

// 주사위 결과 카운트
export function countFaces(dice: Face[]): Record<Face, number> {
  const counts: Record<Face, number> = {
    shark: 0,
    diver: 0,
    crab: 0,
    seaweed: 0,
    fish: 0,
    clam: 0
  };
  
  dice.forEach(face => {
    counts[face]++;
  });
  
  return counts;
}

// 초기 플레이어 상태 생성
export function createInitialPlayerState(): PlayerState {
  return {
    round: 1,
    depth: 1,
    diceActive: DEFAULT_RULES.dicePerRound,
    removedThisRound: 0,
    inventory: {
      bait: {
        shark: 0,
        diver: 0,
        crab: 0,
        seaweed: 0,
        fish: 0,
        clam: 0
      },
      fish: 0,
      predators: []
    },
    log: ['게임을 시작합니다!'],
    outcome: 'running'
  };
}

// 라운드 종료 후 상태 리셋
export function resetForNextRound(state: PlayerState): PlayerState {
  return {
    ...state,
    round: state.round + 1,
    depth: 1,
    diceActive: DEFAULT_RULES.dicePerRound,
    removedThisRound: 0,
    outcome: state.round >= DEFAULT_RULES.roundsTotal ? 'ended' : 'running'
  };
}
