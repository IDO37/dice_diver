<template>
  <div class="home">
    <div class="hero-section">
      <h1 class="hero-title">🤿 Dice Diver</h1>
      <p class="hero-subtitle">심해 탐험 다이스 게임</p>
      <p class="hero-description">
        주사위를 굴려 심해로 잠수하고, 다양한 해양 생물들을 만나며 점수를 획득하세요!
        총 10라운드 동안 최고 점수를 노려보세요.
      </p>
      <div class="game-features">
        <div class="feature">
          <div class="feature-icon">🎲</div>
          <h3>주사위 게임</h3>
          <p>6개의 주사위로 운명을 결정하세요</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🌊</div>
          <h3>6층 심해 탐험</h3>
          <p>각 층마다 다른 보물과 위험이 기다립니다</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🏆</div>
          <h3>점수 경쟁</h3>
          <p>먹이, 물고기, 포식자로 점수를 획득하세요</p>
        </div>
      </div>
      <div class="cta-section">
        <RouterLink to="/game" class="cta-button">바로 플레이</RouterLink>
        <RouterLink to="/rules" class="cta-button secondary">게임 룰 보기</RouterLink>
      </div>
    </div>
    
    <div class="dice-preview">
      <h2>게임 요소</h2>
      <div class="dice-faces">
        <div class="dice-face" v-for="(emoji, face) in diceFaces" :key="face">
          <span class="emoji">{{ emoji }}</span>
          <span class="name">{{ faceNames[face] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DICE_FACE_EMOJIS, DICE_FACE_NAMES } from '../components/DiceFaces';

const diceFaces = DICE_FACE_EMOJIS;
const faceNames = DICE_FACE_NAMES;
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.hero-section {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  border-radius: 1rem;
  margin-bottom: 3rem;
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #b3e5fc;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  color: #e1f5fe;
}

.game-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature h3 {
  margin-bottom: 0.5rem;
  color: #81d4fa;
}

.feature p {
  color: #b3e5fc;
  font-size: 0.9rem;
}

.cta-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s;
  min-width: 150px;
}

.cta-button:not(.secondary) {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
}

.cta-button.secondary {
  background: transparent;
  color: #81d4fa;
  border: 2px solid #81d4fa;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.dice-preview {
  padding: 2rem;
}

.dice-preview h2 {
  margin-bottom: 2rem;
  color: #2c5364;
}

.dice-faces {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.dice-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dice-face .emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.dice-face .name {
  font-weight: bold;
  color: #1565c0;
}
</style>
