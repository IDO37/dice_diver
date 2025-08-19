<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <RouterLink to="/" class="nav-logo">🤿 Dice Diver</RouterLink>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">홈</RouterLink>
          <RouterLink to="/rules" class="nav-link">룰</RouterLink>
          <RouterLink to="/game" class="nav-link">게임</RouterLink>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Deep Sea Gradation Theme */
:global(body) {
  background: linear-gradient(180deg, 
    #001122 0%,     /* Deep ocean surface */
    #002244 25%,    /* Twilight zone */
    #003366 50%,    /* Midnight zone */
    #001133 75%,    /* Abyssal zone */
    #000011 100%    /* Hadal zone */
  );
  background-attachment: fixed;
}

.navbar {
  background: linear-gradient(135deg, 
    rgba(0, 17, 34, 0.95) 0%,
    rgba(0, 34, 68, 0.95) 50%,
    rgba(0, 51, 102, 0.95) 100%
  );
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 100, 200, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 200, 255, 0.2);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #64c8ff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 0 0 10px rgba(100, 200, 255, 0.5);
  transition: all 0.3s ease;
}

.nav-logo:hover {
  color: #87ceeb;
  text-shadow: 0 0 15px rgba(135, 206, 235, 0.8);
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #b3e5fc;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(100, 200, 255, 0.3), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: linear-gradient(135deg, 
    rgba(100, 200, 255, 0.2), 
    rgba(135, 206, 235, 0.3)
  );
  border-color: rgba(100, 200, 255, 0.5);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(100, 200, 255, 0.3);
  transform: translateY(-2px);
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  background: transparent;
}
</style>
