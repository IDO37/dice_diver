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

    <!-- Two Column Layout -->
    <div class="game-layout">
      <!-- Left Column: Floor Exploration -->
      <div class="left-column">
        <!-- Multi-Layer Ocean Display -->
    <div class="ocean-layers">
      <h3>🌊 바다 층별 탐사</h3>
      <div class="layers-container">
        <div 
          v-for="floor in floors" 
          :key="floor.level"
          :class="['ocean-layer', { 'current-layer': floor.level === gameState.depth, 'accessible-layer': canDiveToLayer(floor.level) }]"
        >
          <div class="layer-header">
            <div class="layer-info">
              <h4>{{ floor.level }}층 ({{ floor.cards.length }}장)</h4>
              <div class="layer-requirement">
                <span v-if="floor.level <= 3">
                  <strong>획득 조건:</strong> 주사위 마크 일치
                </span>
                <span v-else-if="floor.level === 4">
                  <strong>획득 조건:</strong> 🐟 물고기 주사위 1개 이상
                </span>
                <span v-else>
                  <strong>획득 조건:</strong> 자동 획득 (1장)
                </span>
              </div>
            </div>
            <div class="layer-controls" v-if="gamePhase === 'diving' && canDiveToLayer(floor.level)">
              <button 
                @click="diveToLayer(floor.level)" 
                :class="['btn', 'btn-dive', { 'btn-current': floor.level === gameState.depth }]"
                :disabled="gameState.outcome !== 'running' || isDiceRolling || currentDice.length === 0"
              >
                <span v-if="floor.level === gameState.depth">현재 위치</span>
                <span v-else>{{ floor.level }}층 다이빙</span>
              </button>
            </div>
          </div>
          <div class="floor-cards">
            <div 
              v-for="card in floor.cards" 
              :key="card.id"
              :class="['card', 'enhanced-card', getCardTypeClass(card.type), { 'card-acquired': cardAcquisitionEffect === card.id, 'card-dimmed': floor.level !== gameState.depth && gamePhase === 'exploring' }]"
            >
              <!-- Dice Marker (Upper Left) -->
              <div class="card-dice-marker" v-if="card.mark">
                <span class="dice-marker-emoji">{{ getDiceEmoji(card.mark) }}</span>
              </div>
              <div class="card-dice-marker fish-marker" v-else-if="card.type === 'fish'">
                <span class="dice-marker-emoji">🐟</span>
              </div>
              
              <div class="card-content">
                <div class="card-icon">
                  <span v-if="card.mark" class="card-emoji">{{ getDiceEmoji(card.mark) }}</span>
                  <span v-else-if="card.type === 'fish'" class="card-emoji">🐟</span>
                  <span v-else-if="card.predator" class="card-emoji">🦈</span>
                </div>
                <div class="card-info">
                  <div class="card-name">
                    <span v-if="card.mark">{{ getDiceName(card.mark) }}</span>
                    <span v-else-if="card.type === 'fish'">물고기</span>
                    <span v-else-if="card.predator">{{ card.predator }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Score Display (Lower Right) -->
              <div class="card-score-display">
                <span v-if="card.type === 'bait'" class="score-text">½점</span>
                <span v-else-if="card.type === 'fish'" class="score-text">3점</span>
                <span v-else-if="card.type === 'predator'" class="score-text">1-12점</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
              :class="['dice', { 'dice-rolling': isDiceRolling }]"
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
      </div>

      <!-- Right Column: Controls and Info -->
      <div class="right-column">
        <!-- Game Phase Controls -->
        <div class="phase-controls">
          <div v-if="gamePhase === 'diving'" class="diving-phase">
            <h3>🤿 잠수 단계</h3>
            <div class="phase-buttons">
              <button 
                @click="rollDivingDice" 
                :class="['btn', 'btn-primary', { 'btn-rolling': isDiceRolling }]"
                :disabled="gameState.outcome !== 'running' || isDiceRolling"
              >
                <span v-if="isDiceRolling">🎲 굴리는 중...</span>
                <span v-else>🎲 주사위 굴리기 ({{ gameState.diceActive }}개)</span>
              </button>
              <button 
                v-if="hasNoPossibleActions" 
                @click="endRoundEarly" 
                class="btn btn-secondary"
                :disabled="gameState.outcome !== 'running'"
              >
                ⏭️ 라운드 건너뛰기
              </button>
            </div>
          </div>
        </div>
        <div v-if="hasNoPossibleActions" class="no-actions">
          <p>🚫 사용할 수 있는 주사위가 없습니다.</p>
          <button @click="endRoundEarly" class="btn btn-secondary">
            라운드 건너뛰기
          </button>
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
        </div>
      </div>
    </div>

    <!-- Enhanced Game End Screen -->
    <GameEndScreen
      v-if="showEndScreen && gameResult"
      :gameResult="gameResult"
      :baitCount="baitCount"
      :predatorDetails="predatorDetails"
      @newGame="startNewGame"
      @viewScores="viewHighScores"
      @close="closeEndScreen"
    />
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
  feedPredator
} from '../game/scoring';
import { 
  addGameResult,
  cleanupOldScores,
  GameResult
} from './ScoreManager';
import GameEndScreen from './GameEndScreen.vue';
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
const gameResult = ref<GameResult | null>(null);
const showEndScreen = ref(false);
const isDiceRolling = ref(false);
const cardAcquisitionEffect = ref<string | null>(null);

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

const shouldShowSkipButton = computed(() => {
  if (gamePhase.value !== 'diving' || currentDice.value.length === 0) return false;
  const counts = countFaces(currentDice.value);
  return counts.shark >= rules.skipIfSharksGTE;
});

const hasNoPossibleActions = computed(() => {
  if (gamePhase.value === 'diving') {
    return gameState.diceActive === 0 && currentDice.value.length === 0;
  }
  return false;
});

// Remove unused computed property
// const finalScores = computed(() => {
//   return calculateTotalScore(gameState);
// });

const baitCount = computed(() => {
  return Object.values(gameState.inventory.bait).reduce((sum, count) => sum + count, 0);
});

const predatorDetails = computed(() => {
  const total = gameState.inventory.predators.length;
  const fed = gameState.inventory.predators.filter(p => p.eaten).length;
  return `${fed}/${total} 먹임`;
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

function canDiveToLayer(targetLevel: number): boolean {
  if (gamePhase.value !== 'diving' || currentDice.value.length === 0) return false;
  
  const counts = countFaces(currentDice.value);
  const diverCount = counts.diver;
  
  // Can always dive to accessible layers if you have divers or can force dive
  if (diverCount > 0) {
    // With divers, can dive to any layer within range
    const maxDepth = Math.min(6, gameState.depth + diverCount);
    return targetLevel >= gameState.depth && targetLevel <= maxDepth;
  } else {
    // Without divers, can only force dive one layer down
    return targetLevel === Math.min(6, gameState.depth + 1);
  }
}

function diveToLayer(targetLevel: number): void {
  if (!canDiveToLayer(targetLevel)) return;
  
  const counts = countFaces(currentDice.value);
  const diverCount = counts.diver;
  
  // Remove sharks first
  if (counts.shark >= rules.skipIfSharksGTE) {
    addLog(`상어가 ${counts.shark}개! 라운드를 건너뜁니다.`);
    endRoundEarly();
    return;
  }
  
  // Remove sharks from active dice
  gameState.removedThisRound += counts.shark;
  gameState.diceActive -= counts.shark;
  
  // Handle diving to target layer
  if (diverCount > 0) {
    // Normal diving with divers
    gameState.depth = targetLevel;
    addLog(`${diverCount}명의 잠수부로 ${targetLevel}층으로 다이빙했습니다.`);
  } else {
    // Force dive (no divers)
    if (gameState.diceActive > 0) {
      gameState.diceActive--;
      gameState.removedThisRound++;
    }
    gameState.depth = targetLevel;
    addLog(`잠수부가 없어 주사위 1개를 제거하고 ${targetLevel}층으로 강제 하강했습니다.`);
  }
}

// Game Actions
function startNewGame() {
  Object.assign(gameState, createInitialPlayerState());
  floors.value = createAllFloorDecks();
  predatorBaitMapping.value = createPredatorBaitMapping();
  currentDice.value = [];
  gamePhase.value = 'diving';
  hasExplored.value = false;
  showEndScreen.value = false;
  gameResult.value = null;
  isDiceRolling.value = false;
  cardAcquisitionEffect.value = null;
  addLog('새 게임을 시작했습니다!');
}

function closeEndScreen() {
  showEndScreen.value = false;
}

function viewHighScores() {
  // This could open a high scores modal in the future
  console.log('High scores feature coming soon!');
}

function rollDivingDice() {
  isDiceRolling.value = true;
  
  // Add rolling animation delay
  setTimeout(() => {
    currentDice.value = rollDice(gameState.diceActive);
    const counts = countFaces(currentDice.value);
    
    addLog(`주사위를 굴렸습니다: ${formatDiceResult(counts)}`);
    
    // Show dice results even with 3+ sharks - let player see what happened
    if (counts.shark >= rules.skipIfSharksGTE) {
      addLog(`상어가 ${counts.shark}개! 라운드를 건너뛸 수 있습니다.`);
    } else {
      addLog('다이빙할 층을 선택하세요!');
    }
    
    isDiceRolling.value = false;
  }, 1000); // 1 second rolling animation
}

function startExploring() {
  gamePhase.value = 'exploring';
  addLog(`${gameState.depth}층에서 탐사를 시작합니다.`);
}

function rollExploringDice() {
  isDiceRolling.value = true;
  
  setTimeout(() => {
    currentDice.value = rollDice(gameState.diceActive);
    const counts = countFaces(currentDice.value);
    
    addLog(`탐사 주사위: ${formatDiceResult(counts)}`);
    
    // 층별 탐사 로직
    const floor = currentFloor.value;
    if (!floor) {
      isDiceRolling.value = false;
      return;
    }
    
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
    isDiceRolling.value = false;
  }, 1000);
}

function exploreBaitFloor(floor: Floor, counts: Record<Face, number>) {
  const baitFaces: Face[] = ['crab', 'seaweed', 'fish', 'clam'];
  let acquired = 0;
  
  for (const baitFace of baitFaces) {
    const diceCount = counts[baitFace];
    if (diceCount > 0 && hasCardWithMark(floor, baitFace)) {
      const card = getFirstCardWithMark(floor, baitFace);
      if (card) {
        // Trigger card acquisition effect
        cardAcquisitionEffect.value = card.id;
        setTimeout(() => {
          cardAcquisitionEffect.value = null;
        }, 1500);
        
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
    
    // Trigger card acquisition effect
    cardAcquisitionEffect.value = fishCard.id;
    setTimeout(() => {
      cardAcquisitionEffect.value = null;
    }, 1500);
    
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
    
    // Trigger card acquisition effect
    cardAcquisitionEffect.value = predatorCard.id;
    setTimeout(() => {
      cardAcquisitionEffect.value = null;
    }, 1500);
    
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
    
    // Create game result and show enhanced end screen
    gameResult.value = addGameResult(gameState);
    showEndScreen.value = true;
    
    // Clean up old scores
    cleanupOldScores();
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
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(180deg, 
    rgba(0, 17, 34, 0.95) 0%,     /* Deep ocean surface */
    rgba(0, 34, 68, 0.9) 25%,     /* Twilight zone */
    rgba(0, 51, 102, 0.85) 50%,   /* Midnight zone */
    rgba(0, 17, 51, 0.9) 75%,     /* Abyssal zone */
    rgba(0, 0, 17, 0.95) 100%     /* Hadal zone */
  );
  border-radius: 1.5rem;
  color: white;
  min-height: 70vh;
  box-shadow: 0 15px 45px rgba(0, 100, 200, 0.3);
  border: 1px solid rgba(100, 200, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transform: scale(0.9);
  transform-origin: top center;
}

/* Two Column Layout */
.game-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  margin-top: 1rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.dice-game::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(100, 200, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(135, 206, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(0, 191, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.dice-game > * {
  position: relative;
  z-index: 1;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, 
    rgba(100, 200, 255, 0.15) 0%,
    rgba(135, 206, 235, 0.1) 100%
  );
  border-radius: 1rem;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(100, 200, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 100, 200, 0.2);
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

/* Multi-Layer Ocean Display */
.ocean-layers {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(180deg, 
    rgba(0, 50, 100, 0.1) 0%,
    rgba(0, 30, 80, 0.15) 100%
  );
  border-radius: 0.75rem;
  border: 1px solid rgba(100, 200, 255, 0.2);
}

.ocean-layers h3 {
  margin-bottom: 1.5rem;
  color: #81d4fa;
  text-align: center;
  font-size: 1.5rem;
}

.layers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ocean-layer {
  padding: 0.75rem;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%,
    rgba(100, 200, 255, 0.08) 100%
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ocean-layer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 70%, rgba(100, 200, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.ocean-layer > * {
  position: relative;
  z-index: 1;
}

.current-layer {
  border-color: rgba(255, 215, 0, 0.6);
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 193, 7, 0.15) 100%
  );
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.accessible-layer {
  border-color: rgba(100, 200, 255, 0.4);
}

.accessible-layer:hover {
  border-color: rgba(100, 200, 255, 0.6);
  box-shadow: 0 4px 15px rgba(100, 200, 255, 0.2);
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.layer-info h4 {
  color: #81d4fa;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.layer-requirement {
  font-size: 0.85rem;
  color: #b3e5fc;
  opacity: 0.9;
}

.layer-controls {
  display: flex;
  gap: 0.5rem;
}

.btn-dive {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00bcd4, #0097a7);
  color: white;
  border: 2px solid rgba(0, 188, 212, 0.5);
  border-radius: 1.5rem;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-dive::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-dive:hover:not(:disabled)::before {
  left: 100%;
}

.btn-dive:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.4);
  border-color: rgba(0, 188, 212, 0.8);
}

.btn-current {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  border-color: rgba(255, 193, 7, 0.5);
  color: #000;
  font-weight: bold;
}

.btn-current:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  border-color: rgba(255, 193, 7, 0.8);
}

.floor-cards {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-height: 60px;
}

.card-dimmed {
  opacity: 0.6;
  filter: grayscale(0.3);
}

.diving-instructions {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(100, 200, 255, 0.1) 0%,
    rgba(135, 206, 235, 0.05) 100%
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(100, 200, 255, 0.2);
}

.diving-instructions p {
  margin: 0.5rem 0;
  color: #b3e5fc;
  font-size: 0.9rem;
}

.shark-warning {
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(255, 107, 107, 0.15) 0%,
    rgba(238, 90, 36, 0.1) 100%
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 107, 107, 0.3);
  text-align: center;
}

.shark-warning p {
  color: #ffcdd2;
  margin-bottom: 1rem;
}

.btn-warning {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border: 2px solid rgba(255, 152, 0, 0.5);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.5);
  border-color: rgba(255, 152, 0, 0.8);
}

.no-actions {
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(158, 158, 158, 0.15) 0%,
    rgba(117, 117, 117, 0.1) 100%
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(158, 158, 158, 0.3);
  text-align: center;
}

.no-actions p {
  color: #cfd8dc;
  margin-bottom: 1rem;
}

.card {
  padding: 0.75rem;
  border-radius: 0.75rem;
  min-width: 100px;
  min-height: 130px;
  text-align: center;
  font-size: 0.8rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 100, 200, 0.4);
  border-color: rgba(100, 200, 255, 0.5);
}

.card-acquired {
  animation: cardAcquisition 1.5s ease-out;
}

@keyframes cardAcquisition {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(100, 200, 255, 0.8);
    border-color: rgba(100, 200, 255, 1);
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
}

/* Card HUD Elements */
.card-dice-marker {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.9), rgba(135, 206, 235, 0.8));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.fish-marker {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(30, 136, 229, 0.8));
}

.dice-marker-emoji {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.card-score-display {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 193, 7, 0.8));
  color: #000;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.score-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
  border-radius: 0.75rem;
  color: #333;
  min-width: 80px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border: 1px solid rgba(100, 200, 255, 0.3);
}

.dice:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 100, 200, 0.4);
}

.dice-rolling {
  animation: diceShake 1s ease-in-out;
}

@keyframes diceShake {
  0%, 100% { transform: rotate(0deg) scale(1); }
  10% { transform: rotate(-5deg) scale(1.05); }
  20% { transform: rotate(5deg) scale(0.95); }
  30% { transform: rotate(-5deg) scale(1.05); }
  40% { transform: rotate(5deg) scale(0.95); }
  50% { transform: rotate(-3deg) scale(1.02); }
  60% { transform: rotate(3deg) scale(0.98); }
  70% { transform: rotate(-2deg) scale(1.01); }
  80% { transform: rotate(2deg) scale(0.99); }
  90% { transform: rotate(-1deg) scale(1.005); }
}

.dice-emoji {
  font-size: 1.8rem;
  margin-bottom: 0.4rem;
}

.dice-name {
  font-size: 0.65rem;
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
  padding: 1rem 2rem;
  border: none;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-rolling {
  animation: buttonPulse 1s infinite;
}

@keyframes buttonPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24, #ff7675);
  color: white;
  border-color: rgba(255, 107, 107, 0.5);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
  border-color: rgba(255, 107, 107, 0.8);
}

.btn-secondary {
  background: linear-gradient(135deg, #74b9ff, #0984e3, #00b894);
  color: white;
  border-color: rgba(116, 185, 255, 0.5);
  box-shadow: 0 4px 15px rgba(116, 185, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(116, 185, 255, 0.5);
  border-color: rgba(116, 185, 255, 0.8);
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
  
  .game-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .right-column {
    max-height: none;
    overflow-y: visible;
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
  
  .layer-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .layer-controls {
    width: 100%;
    justify-content: center;
  }
  
  .btn-dive {
    flex: 1;
    min-width: 120px;
  }
  
  .ocean-layers {
    padding: 1rem;
  }
  
  .floor-cards {
    justify-content: center;
  }
}
</style>
