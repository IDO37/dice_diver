<template>
  <div class="game-end-overlay" @click="handleOverlayClick">
    <div class="game-end-screen" :class="{ 'new-record': isNewRecord }">
      <!-- Celebration Effects -->
      <div v-if="isNewRecord" class="celebration-effects">
        <div class="bubble" v-for="n in 20" :key="n" :style="getBubbleStyle(n)"></div>
      </div>
      
      <!-- Header -->
      <div class="end-header">
        <div class="trophy-icon">
          <span v-if="isNewRecord">🏆</span>
          <span v-else-if="gameResult.totalScore >= 50">🥇</span>
          <span v-else-if="gameResult.totalScore >= 30">🥈</span>
          <span v-else-if="gameResult.totalScore >= 15">🥉</span>
          <span v-else>🤿</span>
        </div>
        <h2 class="end-title">
          <span v-if="isNewRecord" class="new-record-text">🎉 신기록! 🎉</span>
          <span v-else>게임 종료!</span>
        </h2>
        <div v-if="isNewRecord" class="record-badge">
          개인 최고 기록 달성!
        </div>
      </div>

      <!-- Score Breakdown -->
      <div class="score-breakdown">
        <div class="total-score">
          <span class="score-label">총 점수</span>
          <span class="score-value animated-score" ref="totalScoreRef">{{ animatedTotalScore }}</span>
        </div>
        
        <div class="score-details">
          <div class="score-item">
            <div class="score-icon">🦀</div>
            <div class="score-info">
              <span class="score-type">먹이</span>
              <span class="score-calculation">{{ baitCount }}장 ÷ 2</span>
            </div>
            <span class="score-points">{{ gameResult.baitScore }}점</span>
          </div>
          
          <div class="score-item">
            <div class="score-icon">🐟</div>
            <div class="score-info">
              <span class="score-type">물고기</span>
              <span class="score-calculation">{{ gameResult.fishScore / 3 }}마리 × 3</span>
            </div>
            <span class="score-points">{{ gameResult.fishScore }}점</span>
          </div>
          
          <div class="score-item">
            <div class="score-icon">🦈</div>
            <div class="score-info">
              <span class="score-type">포식자</span>
              <span class="score-calculation">{{ predatorDetails }}</span>
            </div>
            <span class="score-points">{{ gameResult.predatorScore }}점</span>
          </div>
        </div>
      </div>

      <!-- Game Stats -->
      <div class="game-stats">
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-icon">🎲</div>
            <div class="stat-value">{{ gameResult.gameplayStats.totalDiceRolls }}</div>
            <div class="stat-label">주사위 굴림</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ gameResult.maxDepth }}층</div>
            <div class="stat-label">최대 깊이</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🃏</div>
            <div class="stat-value">{{ gameResult.gameplayStats.cardsAcquired }}</div>
            <div class="stat-label">획득 카드</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🍽️</div>
            <div class="stat-value">{{ gameResult.gameplayStats.predatorsFed }}</div>
            <div class="stat-label">먹인 포식자</div>
          </div>
        </div>
      </div>

      <!-- Rankings -->
      <div class="rankings" v-if="rankings">
        <h3>순위</h3>
        <div class="rank-grid">
          <div class="rank-item">
            <span class="rank-period">전체</span>
            <span class="rank-position"># {{ rankings.allTime }}</span>
          </div>
          <div class="rank-item">
            <span class="rank-period">오늘</span>
            <span class="rank-position"># {{ rankings.today }}</span>
          </div>
          <div class="rank-item">
            <span class="rank-period">이번 주</span>
            <span class="rank-position"># {{ rankings.thisWeek }}</span>
          </div>
        </div>
      </div>

      <!-- Personal Best Comparison -->
      <div class="personal-best" v-if="personalBest && !isNewRecord">
        <div class="best-score">
          <span class="best-label">개인 최고:</span>
          <span class="best-value">{{ personalBest.totalScore }}점</span>
          <span class="best-diff" :class="scoreDiffClass">
            {{ scoreDifference > 0 ? '+' : '' }}{{ scoreDifference }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="$emit('newGame')" class="btn btn-primary">
          <span class="btn-icon">🎮</span>
          다시 시작
        </button>
        <button @click="$emit('viewScores')" class="btn btn-secondary">
          <span class="btn-icon">📊</span>
          기록 보기
        </button>
        <button @click="$emit('close')" class="btn btn-tertiary">
          <span class="btn-icon">❌</span>
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { GameResult, getPersonalBest, getScoreRank } from './ScoreManager';

interface Props {
  gameResult: GameResult;
  baitCount: number;
  predatorDetails: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  newGame: [];
  viewScores: [];
  close: [];
}>();

const totalScoreRef = ref<HTMLElement>();
const animatedTotalScore = ref(0);

const personalBest = computed(() => getPersonalBest());
const isNewRecord = computed(() => 
  !personalBest.value || props.gameResult.totalScore > personalBest.value.totalScore
);

const scoreDifference = computed(() => {
  if (!personalBest.value) return 0;
  return props.gameResult.totalScore - personalBest.value.totalScore;
});

const scoreDiffClass = computed(() => ({
  'positive': scoreDifference.value > 0,
  'negative': scoreDifference.value < 0,
  'neutral': scoreDifference.value === 0
}));

const rankings = computed(() => ({
  allTime: getScoreRank(props.gameResult.totalScore, 'allTime'),
  today: getScoreRank(props.gameResult.totalScore, 'today'),
  thisWeek: getScoreRank(props.gameResult.totalScore, 'thisWeek')
}));

function getBubbleStyle(_index: number) {
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 2;
  const left = Math.random() * 100;
  const size = 10 + Math.random() * 20;
  
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`
  };
}

function animateScore() {
  const target = props.gameResult.totalScore;
  const duration = 2000; // 2 seconds
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(target, Math.floor(increment * step));
    animatedTotalScore.value = current;
    
    if (current >= target) {
      clearInterval(timer);
    }
  }, duration / steps);
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close');
  }
}

onMounted(() => {
  setTimeout(animateScore, 500);
});
</script>

<style scoped>
.game-end-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 17, 34, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.game-end-screen {
  background: linear-gradient(135deg, 
    rgba(0, 34, 68, 0.95) 0%,
    rgba(0, 51, 102, 0.95) 50%,
    rgba(0, 68, 136, 0.95) 100%
  );
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 100, 200, 0.4);
  position: relative;
  animation: slideUp 0.6s ease-out;
}

.game-end-screen.new-record {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
}

.celebration-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: 20px;
}

.bubble {
  position: absolute;
  background: radial-gradient(circle, rgba(100, 200, 255, 0.8), rgba(135, 206, 235, 0.4));
  border-radius: 50%;
  animation: floatUp 4s infinite linear;
}

@keyframes floatUp {
  0% {
    bottom: -50px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 100%;
    opacity: 0;
  }
}

.end-header {
  margin-bottom: 2rem;
}

.trophy-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.end-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #64c8ff;
  text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
}

.new-record-text {
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s infinite;
}

.record-badge {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: bold;
  display: inline-block;
  animation: pulse 2s infinite;
}

.score-breakdown {
  margin-bottom: 2rem;
}

.total-score {
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.2), rgba(135, 206, 235, 0.3));
  border: 2px solid rgba(100, 200, 255, 0.5);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.score-label {
  display: block;
  font-size: 1.2rem;
  color: #b3e5fc;
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 3rem;
  font-weight: bold;
  color: #64c8ff;
  text-shadow: 0 0 15px rgba(100, 200, 255, 0.7);
}

.animated-score {
  transition: all 0.3s ease;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.score-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.score-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.score-info {
  flex: 1;
  text-align: left;
}

.score-type {
  display: block;
  font-weight: bold;
  color: #64c8ff;
}

.score-calculation {
  display: block;
  font-size: 0.9rem;
  color: #b3e5fc;
}

.score-points {
  font-size: 1.5rem;
  font-weight: bold;
  color: #87ceeb;
}

.game-stats {
  margin-bottom: 2rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #64c8ff;
  display: block;
}

.stat-label {
  font-size: 0.9rem;
  color: #b3e5fc;
}

.rankings {
  margin-bottom: 2rem;
}

.rankings h3 {
  color: #64c8ff;
  margin-bottom: 1rem;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.rank-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-period {
  font-size: 0.9rem;
  color: #b3e5fc;
  margin-bottom: 0.5rem;
}

.rank-position {
  font-size: 1.5rem;
  font-weight: bold;
  color: #64c8ff;
}

.personal-best {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.best-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.best-label {
  color: #b3e5fc;
}

.best-value {
  font-weight: bold;
  color: #64c8ff;
}

.best-diff {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
}

.best-diff.positive {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
}

.best-diff.negative {
  color: #f44336;
  background: rgba(244, 67, 54, 0.2);
}

.best-diff.neutral {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.2);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
}

.btn-tertiary {
  background: linear-gradient(45deg, #636e72, #2d3436);
  color: white;
}

.btn-icon {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .game-end-screen {
    padding: 2rem;
    margin: 1rem;
  }
  
  .end-title {
    font-size: 2rem;
  }
  
  .score-value {
    font-size: 2.5rem;
  }
  
  .rank-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
