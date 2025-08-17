<template>
  <div class="rules">
    <div class="rules-container">
      <h1 class="rules-title">🤿 Dice Diver 게임 룰</h1>
      
      <section class="rules-section">
        <h2>🎯 게임 목표</h2>
        <p>총 10라운드 동안 주사위를 굴려 심해를 탐험하고, 먹이와 물고기, 포식자를 획득하여 최고 점수를 달성하세요!</p>
      </section>

      <section class="rules-section">
        <h2>🎲 주사위 면</h2>
        <div class="dice-grid">
          <div class="dice-item" v-for="(emoji, face) in diceFaces" :key="face">
            <span class="dice-emoji">{{ emoji }}</span>
            <span class="dice-name">{{ faceNames[face] }}</span>
          </div>
        </div>
      </section>

      <section class="rules-section">
        <h2>🏗️ 층별 구조</h2>
        <div class="floor-grid">
          <div class="floor-item">
            <h3>1-3층 (먹이층)</h3>
            <p>🦀🌿🐟🐚 먹이 카드들이 있습니다</p>
            <ul>
              <li>1층: 6장</li>
              <li>2층: 5장</li>
              <li>3층: 4장</li>
            </ul>
          </div>
          <div class="floor-item">
            <h3>4층 (물고기층)</h3>
            <p>🐟 물고기 카드 3장이 있습니다</p>
          </div>
          <div class="floor-item">
            <h3>5-6층 (포식자층)</h3>
            <p>포식자 카드들이 있습니다</p>
            <ul>
              <li>5층: 2장</li>
              <li>6층: 1장</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rules-section">
        <h2>🌊 라운드 진행</h2>
        <div class="phase-grid">
          <div class="phase-item">
            <h3>1. 잠수 단계</h3>
            <ul>
              <li>주사위 6개를 굴립니다</li>
              <li>🤿 잠수부 개수만큼 층 하강</li>
              <li>🦈 상어는 이번 라운드 동안 임시 제거</li>
              <li>🦈 상어가 3개 이상이면 라운드 즉시 종료</li>
              <li>🤿 잠수부가 0개면: 주사위 1개 임시 제거 후 1층 강제 하강</li>
              <li>원하는 층에 도달할 때까지 반복 가능</li>
            </ul>
          </div>
          <div class="phase-item">
            <h3>2. 탐사 단계</h3>
            <ul>
              <li>남은 주사위를 모두 다시 굴림</li>
              <li><strong>1-3층:</strong> 주사위 마크와 카드 마크가 일치하면 획득</li>
              <li><strong>4층:</strong> 🐟가 1개 이상 나오면 물고기 카드 1장 획득</li>
              <li><strong>5-6층:</strong> 포식자 카드 1장 획득</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rules-section">
        <h2>🏆 점수 계산</h2>
        <div class="scoring-grid">
          <div class="scoring-item">
            <h3>🦀🌿🐚 먹이</h3>
            <p><strong>2장 = 1점</strong></p>
            <p>홀수 장수는 0점 (버림)</p>
          </div>
          <div class="scoring-item">
            <h3>🐟 물고기</h3>
            <p><strong>1장 = 3점</strong></p>
          </div>
          <div class="scoring-item">
            <h3>🦈 포식자</h3>
            <p><strong>기본 1점</strong></p>
            <p>먹이를 주면 <strong>8-12점</strong></p>
          </div>
        </div>
      </section>

      <section class="rules-section">
        <h2>🍽️ 포식자 먹이주기</h2>
        <p>게임 시작 시 포식자와 먹이가 랜덤으로 매핑됩니다:</p>
        <div class="predator-mapping" v-if="predatorMapping">
          <div class="mapping-item" v-for="(bait, predator) in predatorMapping" :key="predator">
            <span class="predator">{{ predator }}</span>
            <span class="arrow">→</span>
            <span class="bait">{{ diceFaces[bait] }} {{ faceNames[bait] }}</span>
          </div>
        </div>
        <p class="mapping-note">* 매 게임마다 다르게 매핑됩니다</p>
      </section>

      <section class="rules-section">
        <h2>⚠️ 특수 규칙</h2>
        <ul class="special-rules">
          <li><strong>상어 3개 이상:</strong> 라운드 즉시 종료, 탐사 불가</li>
          <li><strong>잠수부 0개:</strong> 주사위 1개 임시 제거 후 1층 강제 하강, 재시도 가능</li>
          <li><strong>임시 제거된 주사위:</strong> 다음 라운드에 복구</li>
          <li><strong>잠수 위치:</strong> 매 라운드 시작 시 1층으로 리셋</li>
        </ul>
      </section>

      <div class="cta-section">
        <RouterLink to="/game" class="play-button">게임 시작하기</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DICE_FACE_EMOJIS, DICE_FACE_NAMES } from '../components/DiceFaces';
import { createPredatorBaitMapping } from '../game/deck';

const diceFaces = DICE_FACE_EMOJIS;
const faceNames = DICE_FACE_NAMES;
const predatorMapping = ref<Record<string, any> | null>(null);

onMounted(() => {
  predatorMapping.value = createPredatorBaitMapping();
});
</script>

<style scoped>
.rules {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.rules-container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.rules-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c5364;
  background: linear-gradient(45deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rules-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.rules-section h2 {
  color: #1565c0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.dice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.dice-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 0.5rem;
  text-align: center;
}

.dice-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.dice-name {
  font-weight: bold;
  color: #1565c0;
}

.floor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.floor-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 0.5rem;
  border-left: 4px solid #ff9800;
}

.floor-item h3 {
  color: #e65100;
  margin-bottom: 0.5rem;
}

.phase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.phase-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  border-radius: 0.5rem;
  border-left: 4px solid #4caf50;
}

.phase-item h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.phase-item ul {
  margin: 0;
  padding-left: 1.5rem;
}

.phase-item li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.scoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.scoring-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fce4ec, #f8bbd9);
  border-radius: 0.5rem;
  text-align: center;
  border-left: 4px solid #e91e63;
}

.scoring-item h3 {
  color: #ad1457;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.predator-mapping {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.mapping-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  border-radius: 0.5rem;
  font-weight: bold;
}

.predator {
  color: #7b1fa2;
}

.arrow {
  color: #9c27b0;
  font-size: 1.2rem;
}

.bait {
  color: #4a148c;
}

.mapping-note {
  font-style: italic;
  color: #666;
  text-align: center;
  margin-top: 1rem;
}

.special-rules {
  list-style: none;
  padding: 0;
}

.special-rules li {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border-radius: 0.5rem;
  border-left: 4px solid #f44336;
}

.cta-section {
  text-align: center;
  margin-top: 3rem;
}

.play-button {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}
</style>
