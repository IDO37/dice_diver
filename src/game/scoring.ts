import { PlayerState, Face, Card, DEFAULT_RULES } from './rules';

// 먹이 점수 계산 (2장 = 1점, 홀수는 버림)
export function calculateBaitScore(baitCounts: Record<Face, number>): number {
  const totalBait = Object.values(baitCounts).reduce((sum, count) => sum + count, 0);
  return Math.floor(totalBait / 2);
}

// 물고기 점수 계산 (한 장 3점)
export function calculateFishScore(fishCount: number): number {
  return fishCount * 3;
}

// 포식자 점수 계산
export function calculatePredatorScore(predators: Card[]): number {
  return predators.reduce((total, predator) => {
    if (predator.eaten && predator.fedScore) {
      return total + predator.fedScore;
    }
    return total + 1; // 기본 1점
  }, 0);
}

// 총 점수 계산
export function calculateTotalScore(state: PlayerState): {
  baitScore: number;
  fishScore: number;
  predatorScore: number;
  totalScore: number;
} {
  const baitScore = calculateBaitScore(state.inventory.bait);
  const fishScore = calculateFishScore(state.inventory.fish);
  const predatorScore = calculatePredatorScore(state.inventory.predators);
  const totalScore = baitScore + fishScore + predatorScore;

  return {
    baitScore,
    fishScore,
    predatorScore,
    totalScore
  };
}

// 포식자에게 먹이 주기
export function feedPredator(
  state: PlayerState, 
  predatorId: string, 
  predatorBaitMapping: Record<string, Face>
): PlayerState | null {
  const predator = state.inventory.predators.find(p => p.id === predatorId);
  if (!predator || !predator.predator) return null;

  const requiredBait = predatorBaitMapping[predator.predator];
  if (!requiredBait || state.inventory.bait[requiredBait] <= 0) return null;

  // 먹이 소모
  const newBaitCounts = { ...state.inventory.bait };
  newBaitCounts[requiredBait]--;

  // 포식자 먹임 처리
  const fedScore = Math.floor(
    Math.random() * (DEFAULT_RULES.predatorFedScoreRange[1] - DEFAULT_RULES.predatorFedScoreRange[0] + 1)
  ) + DEFAULT_RULES.predatorFedScoreRange[0];

  const updatedPredators = state.inventory.predators.map(p => {
    if (p.id === predatorId) {
      return { ...p, eaten: true, fedScore };
    }
    return p;
  });

  return {
    ...state,
    inventory: {
      ...state.inventory,
      bait: newBaitCounts,
      predators: updatedPredators
    },
    log: [`${predator.predator}에게 먹이를 주었습니다! (+${fedScore}점)`, ...state.log]
  };
}

// 점수 상세 정보를 문자열로 변환
export function formatScoreBreakdown(scores: ReturnType<typeof calculateTotalScore>): string {
  return [
    `먹이 점수: ${scores.baitScore}점`,
    `물고기 점수: ${scores.fishScore}점`,
    `포식자 점수: ${scores.predatorScore}점`,
    `총 점수: ${scores.totalScore}점`
  ].join('\n');
}
