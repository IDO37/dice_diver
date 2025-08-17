<template>
  <div class="game-view">
    <DiceGame />
  </div>
</template>

<script setup lang="ts">
import DiceGame from '../components/DiceGame.vue';
</script>

<style scoped>
.game-view {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
