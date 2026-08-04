<script lang="ts" setup>
import KillListModal from './KillListModal.vue'
</script>

<template>
  <div class="header-wrapper">
    <div class="kill-list-container">
      <KillListModal />
    </div>

    <div class="text-center mb-8">
      <h1 class="title">HeroQuest</h1>
      <div class="flex items-center gap-3 mt-2">
        <div class="divider-line"></div>
        <span class="sword-ornament">⚔</span>
        <p class="subtitle">Persönlichkeits-Pass</p>
        <span class="sword-ornament">⚔</span>
        <div class="divider-line"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.kill-list-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
}

.title {
  font-family: var(--font-fantasy), serif;
  font-size: 1.5rem;
  letter-spacing: 0.15em;
  color: var(--hq-title);
  transition: color 0.4s;
}

.subtitle {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--hq-subtitle);
  transition: color 0.4s;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--hq-divider);
  transition: background-color 0.4s;
}

.sword-ornament {
  font-size: 1.25rem;
  color: var(--hq-ornament);
  transition: color 0.4s;
}

@media (min-width: 480px) {
  .title {
    font-size: 1.875rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }
}
</style>

