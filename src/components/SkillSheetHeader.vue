<script lang="ts" setup>
import KillListModal from './KillListModal.vue'
import ExpansionsModal from './ExpansionsModal.vue'
</script>

<template>
  <div class="header-wrapper">
    <div class="expansions-slot">
      <ExpansionsModal />
    </div>

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
  margin-bottom: var(--space-8);
}

.kill-list-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: var(--z-header-controls);
}

.expansions-slot {
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--z-header-controls);
}

.title {
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-xl);
  letter-spacing: 0.15em;
  color: var(--hq-title);
  transition: color 0.4s;
}

.subtitle {
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-small);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--hq-subtitle);
  transition: color 0.4s;
}

.divider-line {
  flex: 1;
  height: var(--border-width-thin);
  background-color: var(--hq-divider);
  transition: background-color 0.4s;
}

.sword-ornament {
  font-size: var(--font-size-lg);
  color: var(--hq-ornament);
  transition: color 0.4s;
}

@media (min-width: 480px) {
  .title {
    font-size: var(--font-size-title-large);
  }

  .subtitle {
    font-size: var(--font-size-body-small);
  }
}
</style>
