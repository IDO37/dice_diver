<template>
  <div class="dice-game">
    <!-- Game Header -->
    <div class="game-header">
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">라운드</span>
          <span class="stat-value">{{ gameState.round }}/{{ rules.roundsTotal }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">현재 층</span>
          <span class="stat-value">{{ gameState.depth }}층</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">활성 주사위</span>
          <span class="stat-value">{{ gameState.diceActive }}개</span>
        </div>
      </div>
      <div class="game-controls">
        <button 
          @click="startNewGame" 
          class="btn btn-primary"
          :disabled="gameState.outcome === 'running' && gameState.round > 1"
        >
          {{ gameState.outcome === 'ended' ? '다시 시작' : '새 게임' }}
        </button>
      </div>
    </div>

    <!-- Current Floor Display -->
    <div class="current-floor" v-if="currentFloor">
      <h3>{{ currentFloor.level }}층 카드</h3>
      <div class="floor-cards">
        <div 
          v-for="card in currentFloor.cards" 
          :key="card.id"
          :class="['card', getCardTypeClass(card.type)]"
        >
          <span v-if="card.mark" class="card-emoji">{{ getDiceEmoji(card.mark) }}</span>
          <span v-else-if="card.type === 'fish'" class="card-emoji">🐟</span>
          <span v-else-if="card.predator" class="card-text">{{ card.predator }}</span>
        </div>
      </div>
    </div>

    <!-- Dice Display -->
    <div class="dice-section">
      <h3>주사위 결과</h3>
      <div class="dice-container">
        <div 
          v-for="(face, index) in currentDice" 
          :key="index"
          class="dice"
        >
          <span class="dice-emoji">{{ getDiceEmoji(face) }}</span>
          <span class="dice-name">{{ getDiceName(face) }}</span>
        </div>
      </div>
      <div class="dice-summary" v-if="currentDice.length > 0">
        <div v-for="(count, face) in diceCounts" :key="face" class="dice-count">
          <span>{{ getDiceEmoji(face as Face) }} {{ count }}개</span>
        </div>
      </div>
    </div>

    <!-- Game Phase Controls -->
    <div class="phase-controls">
      <div v-if="gamePhase === 'diving'" class="diving-phase">
        <h3>🤿 잠수 단계</h3>
        <div class="phase-buttons">
          <button 
            @click="rollDivingDice" 
            class="btn btn-primary"
            :disabled="gameState.outcome !== 'running'"
          >
            주사위 굴리기 ({{ gameState.diceActive }}개)
          </button>
          <button 
            @click="startExploring" 
            class="btn btn-secondary"
            :disabled="gameState.diceActive === 0 || currentDice.length === 0"
          >
            탐사 시작
          </button>
        </div>
        <p v-if="canForceDive" class="force-dive-notice">
          잠수부가 없습니다! 주사위 1개를 제거하고 1층 강제 하강합니다.
        </p>
      </div>

      <div v-else-if="gamePhase === 'exploring'" class="exploring-phase">
        <h3>🔍 탐사 단계</h3>
        <div class="phase-buttons">
          <button 
            @click="rollExploringDice" 
            class="btn btn-primary"
            :disabled="hasExplored"
          >
            탐사 주사위 굴리기
          </button>
          <button 
            @click="endRound" 
            class="btn btn-secondary"
            :disabled="!hasExplored"
          >
            라운드 종료
          </button>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <div class="inventory">
      <h3>인벤토리</h3>
      <div class="inventory-grid">
        <div class="inventory-section">
          <h4>🦀 먹이</h4>
          <div class="bait-counts">
            <div v-for="(count, bait) in gameState.inventory.bait" :key="bait" class="bait-item">
              <span v-if="count > 0">{{ getDiceEmoji(bait as Face) }} {{ count }}개</span>
            </div>
          </div>
        </div>
        
        <div class="inventory-section">
          <h4>🐟 물고기</h4>
          <p>{{ gameState.inventory.fish }}마리</p>
        </div>
        
        <div class="inventory-section">
          <h4>🦈 포식자</h4>
          <div class="predator-list">
            <div 
              v-for="predator in gameState.inventory.predators" 
              :key="predator.id"
              class="predator-item"
            >
              <span>{{ predator.predator }}</span>
              <span v-if="predator.eaten" class="fed-status">✅ 먹임 ({{ predator.fedScore }}점)</span>
              <button 
                v-else-if="canFeedPredator(predator)"
                @click="feedPredatorAction(predator.id)"
                class="btn btn-small"
              >
                먹이 주기
              </button>
              <span v-else class="unfed-status">🍽️ 기본 1점</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Predator-Bait Mapping -->
    <div class="predator-mapping" v-if="predatorBaitMapping">
      <h3>포식자-먹이 매핑</h3>
      <div class="mapping-grid">
        <div v-for="(bait, predator) in predatorBaitMapping" :key="predator" class="mapping-item">
          <span>{{ predator }} → {{ getDiceEmoji(bait) }} {{ getDiceName(bait) }}</span>
        </div>
      </div>
    </div>

    <!-- Game Log -->
    <div class="game-log">
      <h3>게임 로그</h3>
      <div class="log-container">
        <div v-for="(entry, index) in gameState.log.slice(0, 10)" :key="index" class="log-entry">
          {{ entry }}
        </div>
      </div>
    </div>

    <!-- Game End Screen -->
    <div v-if="gameState.outcome === 'ended'" class="game-end">
      <div class="end-screen">
        <h2>🏆 게임 종료!</h2>
        <div class="final-scores">
          <div class="score-item">
            <span>먹이 점수:</span>
            <span>{{ finalScores.baitScore }}점</span>
          </div>
          <div class="score-item">
            <span>물고기 점수:</span>
            <span>{{ finalScores.fishScore }}점</span>
          </div>
          <div class="score-item">
            <span>포식자 점수:</span>
            <span>{{ finalScores.predatorScore }}점</span>
          </div>
          <div class="score-item total">
            <span>총 점수:</span>
            <span>{{ finalScores.totalScore }}점</span>
          </div>
        </div>
        <button @click="startNewGame" class="btn btn-primary">다시 시작</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  Face, 
  PlayerState, 
  Card, 
  Floor,
  DEFAULT_RULES,
  rollDice,
  countFaces,
  createInitialPlayerState,
  resetForNextRound
} from '../game/rules';
import { 
  createAllFloorDecks, 
  createPredatorBaitMapping,
  removeCardFromFloor,
  hasCardWithMark,
  getFirstCardWithMark
} from '../game/deck';
import { 
  calculateTotalScore,
  feedPredator
} from '../game/scoring';
import { 
  DICE_FACE_EMOJIS, 
  DICE_FACE_NAMES,
  CARD_TYPE_COLORS
} from './DiceFaces';

// Game State
const gameState = reactive<PlayerState>(createInitialPlayerState());
const floors = ref<Floor[]>([]);
const predatorBaitMapping = ref<Record<string, Face> | null>(null);
const currentDice = ref<Face[]>([]);
const gamePhase = ref<'diving' | 'exploring'>('diving');
const hasExplored = ref(false);
const rules = DEFAULT_RULES;

// Computed Properties
const currentFloor = computed(() => {
  return floors.value.find(floor => floor.level === gameState.depth);
});

const diceCounts = computed(() => {
  return countFaces(currentDice.value);
});

const canForceDive = computed(() => {
  return gamePhase.value === 'diving' && 
         currentDice.value.length > 0 && 
         diceCounts.value.diver === 0;
});

const finalScores = computed(() => {
  return calculateTotalScore(gameState);
});

// Helper Functions
function getDiceEmoji(face: Face): string {
  return DICE_FACE_EMOJIS[face];
}

function getDiceName(face: Face): string {
  return DICE_FACE_NAMES[face];
}

function getCardTypeClass(type: string): string {
  return CARD_TYPE_COLORS[type as keyof typeof CARD_TYPE_COLORS] || '';
}

function canFeedPredator(predator: Card): boolean {
  if (!predator.predator || predator.eaten || !predatorBaitMapping.value) return false;
  const requiredBait = predatorBaitMapping.value[predator.predator];
  return gameState.inventory.bait[requiredBait] > 0;
}

// Game Actions
function startNewGame() {
  Object.assign(gameState, createInitialPlayerState());
  floors.value = createAllFloorDecks();
  predatorBaitMapping.value = createPredatorBaitMapping();
  currentDice.value = [];
  gamePhase.value = 'diving';
  hasExplored.value = false;
  addLog('새 게임을 시작했습니다!');
}

function rollDivingDice() {
  currentDice.value = rollDice(gameState.diceActive);
  const counts = countFaces(currentDice.value);
  
  addLog(`주사위를 굴렸습니다: ${formatDiceResult(counts)}`);
  
  // 상어 3개 이상이면 라운드 즉시 종료
  if (counts.shark >= rules.skipIfSharksGTE) {
    addLog(`상어가 ${counts.shark}개! 라운드를 건너뜁니다.`);
    endRoundEarly();
    return;
  }
  
  // 상어 제거
  gameState.removedThisRound += counts.shark;
  gameState.diceActive -= counts.shark;
  
  // 잠수부로 하강
  if (counts.diver > 0) {
    gameState.depth = Math.min(6, gameState.depth + counts.diver);
    addLog(`${counts.diver}명의 잠수부로 ${gameState.depth}층으로 하강했습니다.`);
  } else {
    // 잠수부가 0개면 강제 하강
    if (gameState.diceActive > 0) {
      gameState.diceActive--;
      gameState.removedThisRound++;
    }
    gameState.depth = Math.max(1, gameState.depth + 1);
    addLog('잠수부가 없어 주사위 1개를 제거하고 1층 강제 하강했습니다.');
  }
}

function startExploring() {
  gamePhase.value = 'exploring';
  addLog(`${gameState.depth}층에서 탐사를 시작합니다.`);
}

function rollExploringDice() {
  currentDice.value = rollDice(gameState.diceActive);
  const counts = countFaces(currentDice.value);
  
  addLog(`탐사 주사위: ${formatDiceResult(counts)}`);
  
  // 층별 탐사 로직
  const floor = currentFloor.value;
  if (!floor) return;
  
  if (floor.level <= 3) {
    // 먹이층 (1-3층)
    exploreBaitFloor(floor, counts);
  } else if (floor.level === 4) {
    // 물고기층 (4층)
    exploreFishFloor(floor, counts);
  } else {
    // 포식자층 (5-6층)
    explorePredatorFloor(floor);
  }
  
  hasExplored.value = true;
}

function exploreBaitFloor(floor: Floor, counts: Record<Face, number>) {
  const baitFaces: Face[] = ['crab', 'seaweed', 'fish', 'clam'];
  let acquired = 0;
  
  for (const baitFace of baitFaces) {
    const diceCount = counts[baitFace];
    if (diceCount > 0 && hasCardWithMark(floor, baitFace)) {
      const card = getFirstCardWithMark(floor, baitFace);
      if (card) {
        gameState.inventory.bait[baitFace]++;
        floors.value[floor.level - 1] = removeCardFromFloor(floor, card.id);
        acquired++;
        addLog(`${getDiceEmoji(baitFace)} ${getDiceName(baitFace)} 획득!`);
      }
    }
  }
  
  if (acquired === 0) {
    addLog('획득한 먹이가 없습니다.');
  }
}

function exploreFishFloor(floor: Floor, counts: Record<Face, number>) {
  if (counts.fish > 0 && floor.cards.length > 0) {
    const fishCard = floor.cards[0];
    gameState.inventory.fish++;
    floors.value[floor.level - 1] = removeCardFromFloor(floor, fishCard.id);
    addLog('🐟 물고기 획득!');
  } else {
    addLog('물고기를 획득하지 못했습니다.');
  }
}

function explorePredatorFloor(floor: Floor) {
  if (floor.cards.length > 0) {
    const predatorCard = floor.cards[0];
    gameState.inventory.predators.push({ ...predatorCard });
    floors.value[floor.level - 1] = removeCardFromFloor(floor, predatorCard.id);
    addLog(`${predatorCard.predator} 포식자 획득!`);
  }
}

function feedPredatorAction(predatorId: string) {
  if (!predatorBaitMapping.value) return;
  
  const result = feedPredator(gameState, predatorId, predatorBaitMapping.value);
  if (result) {
    Object.assign(gameState, result);
  }
}

function endRound() {
  addLog(`라운드 ${gameState.round} 종료`);
  
  if (gameState.round >= rules.roundsTotal) {
    gameState.outcome = 'ended';
    addLog('게임이 종료되었습니다!');
  } else {
    Object.assign(gameState, resetForNextRound(gameState));
    gamePhase.value = 'diving';
    hasExplored.value = false;
    currentDice.value = [];
    addLog(`라운드 ${gameState.round} 시작!`);
  }
}

function endRoundEarly() {
  endRound();
}

function addLog(message: string) {
  gameState.log.unshift(`[R${gameState.round}] ${message}`);
  if (gameState.log.length > 50) {
    gameState.log = gameState.log.slice(0, 50);
  }
}

function formatDiceResult(counts: Record<Face, number>): string {
  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([face, count]) => `${getDiceEmoji(face as Face)}${count}`)
    .join(' ');
}

// Initialize Game
onMounted(() => {
  startNewGame();
});
</script>

<style scoped>
.dice-game {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  border-radius: 1rem;
  color: white;
  min-height: 80vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.game-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #b3e5fc;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #81d4fa;
}

.current-floor {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.current-floor h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.floor-cards {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card {
  padding: 0.5rem;
  border-radius: 0.25rem;
  min-width: 60px;
  text-align: center;
  font-size: 0.8rem;
}

.card-bait {
  background: linear-gradient(135deg, #4caf50, #388e3c);
}

.card-fish {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.card-predator {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.card-emoji {
  font-size: 1.2rem;
}

.dice-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.dice-section h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.dice-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.dice {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #fff, #f5f5f5);
  border-radius: 0.5rem;
  color: #333;
  min-width: 80px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.dice-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.dice-name {
  font-size: 0.7rem;
  font-weight: bold;
}

.dice-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.dice-count {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.phase-controls {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.phase-controls h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.phase-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-secondary {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.force-dive-notice {
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 0.25rem;
  color: #ffc107;
  font-size: 0.9rem;
}

.inventory {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.inventory h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.inventory-section {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.inventory-section h4 {
  margin-bottom: 0.5rem;
  color: #b3e5fc;
}

.bait-counts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bait-item {
  font-size: 0.9rem;
}

.predator-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.predator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.fed-status {
  color: #4caf50;
  font-size: 0.8rem;
}

.unfed-status {
  color: #ff9800;
  font-size: 0.8rem;
}

.predator-mapping {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.predator-mapping h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.mapping-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  text-align: center;
}

.game-log {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.game-log h3 {
  margin-bottom: 1rem;
  color: #81d4fa;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: #e1f5fe;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.game-end {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.end-screen {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 3rem;
  border-radius: 1rem;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.end-screen h2 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #ffd700;
}

.final-scores {
  margin-bottom: 2rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.score-item.total {
  border-top: 2px solid #ffd700;
  margin-top: 1rem;
  padding-top: 1rem;
  font-weight: bold;
  font-size: 1.3rem;
  color: #ffd700;
}

@media (max-width: 768px) {
  .dice-game {
    padding: 1rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .game-stats {
    justify-content: center;
  }
  
  .inventory-grid {
    grid-template-columns: 1fr;
  }
  
  .phase-buttons {
    justify-content: center;
  }
}
</style>
