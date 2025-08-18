import { PlayerState } from '../game/rules';
import { calculateTotalScore } from '../game/scoring';

export interface GameResult {
  id: string;
  timestamp: number;
  totalScore: number;
  baitScore: number;
  fishScore: number;
  predatorScore: number;
  roundsCompleted: number;
  maxDepth: number;
  gameplayStats: {
    totalDiceRolls: number;
    cardsAcquired: number;
    predatorsFed: number;
  };
}

export interface HighScores {
  allTime: GameResult[];
  today: GameResult[];
  thisWeek: GameResult[];
}

const STORAGE_KEY = 'dice_diver_scores';
const MAX_STORED_SCORES = 50;

// Load scores from localStorage
export function loadHighScores(): HighScores {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        allTime: parsed.allTime || [],
        today: parsed.today || [],
        thisWeek: parsed.thisWeek || []
      };
    }
  } catch (error) {
    console.warn('Failed to load high scores:', error);
  }
  
  return {
    allTime: [],
    today: [],
    thisWeek: []
  };
}

// Save scores to localStorage
export function saveHighScores(scores: HighScores): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.warn('Failed to save high scores:', error);
  }
}

// Add a new game result
export function addGameResult(state: PlayerState): GameResult {
  const scores = calculateTotalScore(state);
  const now = Date.now();
  
  const result: GameResult = {
    id: `game_${now}`,
    timestamp: now,
    totalScore: scores.totalScore,
    baitScore: scores.baitScore,
    fishScore: scores.fishScore,
    predatorScore: scores.predatorScore,
    roundsCompleted: state.round,
    maxDepth: Math.max(...state.log
      .filter(entry => entry.includes('층으로 하강'))
      .map(entry => {
        const match = entry.match(/(\d+)층으로 하강/);
        return match ? parseInt(match[1]) : 1;
      })
      .concat([1])
    ),
    gameplayStats: {
      totalDiceRolls: state.log.filter(entry => entry.includes('주사위를 굴렸습니다')).length,
      cardsAcquired: state.inventory.fish + 
        Object.values(state.inventory.bait).reduce((sum, count) => sum + count, 0) +
        state.inventory.predators.length,
      predatorsFed: state.inventory.predators.filter(p => p.eaten).length
    }
  };

  const highScores = loadHighScores();
  
  // Add to all-time scores
  highScores.allTime.push(result);
  highScores.allTime.sort((a, b) => b.totalScore - a.totalScore);
  highScores.allTime = highScores.allTime.slice(0, MAX_STORED_SCORES);
  
  // Add to today's scores
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (result.timestamp >= today.getTime()) {
    highScores.today.push(result);
    highScores.today.sort((a, b) => b.totalScore - a.totalScore);
  }
  
  // Add to this week's scores
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  if (result.timestamp >= weekStart.getTime()) {
    highScores.thisWeek.push(result);
    highScores.thisWeek.sort((a, b) => b.totalScore - a.totalScore);
  }
  
  saveHighScores(highScores);
  return result;
}

// Get personal best score
export function getPersonalBest(): GameResult | null {
  const scores = loadHighScores();
  return scores.allTime[0] || null;
}

// Check if score is a new record
export function isNewRecord(score: number): boolean {
  const personalBest = getPersonalBest();
  return !personalBest || score > personalBest.totalScore;
}

// Clean up old scores (called periodically)
export function cleanupOldScores(): void {
  const scores = loadHighScores();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;
  
  // Clean today's scores
  scores.today = scores.today.filter(score => 
    now - score.timestamp < oneDayMs
  );
  
  // Clean this week's scores
  scores.thisWeek = scores.thisWeek.filter(score => 
    now - score.timestamp < oneWeekMs
  );
  
  saveHighScores(scores);
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR');
  }
}

// Get rank for a score
export function getScoreRank(score: number, period: 'allTime' | 'today' | 'thisWeek' = 'allTime'): number {
  const scores = loadHighScores();
  const relevantScores = scores[period];
  const rank = relevantScores.findIndex(s => s.totalScore <= score) + 1;
  return rank || relevantScores.length + 1;
}
