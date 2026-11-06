<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import packageJson from '../../package.json'
import { useSkillSheetStore } from '@/stores/skillSheet'

const version = packageJson.version
const store = useSkillSheetStore()

const clicks = ref(0)
const showReset = ref(false)

async function handleVersionClick() {
  clicks.value++
  if (clicks.value >= 5) {
    showReset.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}

function resetAll() {
  store.reset()
  showReset.value = false
  clicks.value = 0
}
</script>

<template>
  <button
    type="button"
    :class="{ 'version-unlocked': showReset }"
    class="version"
    @click="handleVersionClick"
  >
    Version {{ version }}
  </button>
  <button v-if="showReset" class="reset-btn" @click="resetAll">✦ Alles zurücksetzen</button>
</template>

<style scoped>
.version {
  display: inline-flex;
  min-height: var(--size-button-min);
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--font-size-body-small);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.reset-btn {
  margin-top: 2rem;
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-caption);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hq-btn-reset-text);
  background: transparent;
  border: 1px solid var(--hq-btn-reset-border);
  padding: var(--space-compact) var(--space-3);
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.reset-btn:hover {
  color: var(--color-red);
  border-color: var(--color-red);
}

.version-unlocked {
  animation: unlock-shake 0.5s ease;
  color: var(--color-gold);
}

@keyframes unlock-shake {
  0% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-4px) rotate(-1deg);
  }
  30% {
    transform: translateX(4px) rotate(1deg);
  }
  45% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-1px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
