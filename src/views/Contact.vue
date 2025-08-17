<template>
  <div class="contact">
    <div class="contact-container">
      <h1 class="contact-title">📧 Contact</h1>
      
      <div class="contact-content">
        <div class="contact-section">
          <h2>개발자 정보</h2>
          <p>Dice Diver 게임에 대한 문의사항이나 피드백이 있으시면 언제든 연락해 주세요!</p>
        </div>

        <div class="contact-links">
          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <div class="contact-info">
              <h3>이메일</h3>
              <a href="mailto:developer@dicediver.com" class="contact-link">
                developer@dicediver.com
              </a>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">🐙</div>
            <div class="contact-info">
              <h3>GitHub</h3>
              <a href="https://github.com/developer/dice-diver" target="_blank" class="contact-link">
                github.com/developer/dice-diver
              </a>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div class="contact-info">
              <h3>웹사이트</h3>
              <a href="https://dicediver.vercel.app" target="_blank" class="contact-link">
                dicediver.vercel.app
              </a>
            </div>
          </div>
        </div>

        <div class="feedback-section">
          <h2>피드백 환영</h2>
          <div class="feedback-grid">
            <div class="feedback-item">
              <h3>🐛 버그 리포트</h3>
              <p>게임 중 발견한 버그나 오류를 알려주세요</p>
            </div>
            <div class="feedback-item">
              <h3>💡 기능 제안</h3>
              <p>새로운 기능이나 개선사항을 제안해 주세요</p>
            </div>
            <div class="feedback-item">
              <h3>⭐ 게임 평가</h3>
              <p>게임에 대한 전반적인 평가와 의견을 공유해 주세요</p>
            </div>
          </div>
        </div>

        <div class="game-info">
          <h2>게임 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>버전:</strong> 1.0.0
            </div>
            <div class="info-item">
              <strong>개발 기간:</strong> 2024
            </div>
            <div class="info-item">
              <strong>기술 스택:</strong> Vue 3 + TypeScript + Vite
            </div>
            <div class="info-item">
              <strong>배포:</strong> Vercel
            </div>
          </div>
        </div>

        <div class="cta-section">
          <RouterLink to="/game" class="play-button">게임 플레이하기</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Contact 페이지는 정적 컨텐츠만 포함
</script>

<style scoped>
.contact {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.contact-container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.contact-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c5364;
  background: linear-gradient(45deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.contact-section {
  text-align: center;
}

.contact-section h2 {
  color: #1565c0;
  margin-bottom: 1rem;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 50%;
}

.contact-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1565c0;
}

.contact-link {
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.contact-link:hover {
  color: #1976d2;
  text-decoration: underline;
}

.feedback-section h2 {
  text-align: center;
  color: #1565c0;
  margin-bottom: 2rem;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.feedback-item {
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.feedback-item h3 {
  color: #1565c0;
  margin-bottom: 1rem;
}

.feedback-item p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.game-info h2 {
  text-align: center;
  color: #1565c0;
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info-item strong {
  color: #1565c0;
}

.cta-section {
  text-align: center;
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

@media (max-width: 768px) {
  .contact-item {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-icon {
    margin-bottom: 1rem;
  }
}
</style>
