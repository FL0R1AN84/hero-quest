<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import packageJson from '../../package.json'
import { useSkillSheetStore } from '@/stores/skillSheet'

const version = packageJson.version
const store = useSkillSheetStore()

const clicks = ref(0)
const showReset = ref(false)
const versionButton = ref<HTMLButtonElement | null>(null)

async function handleVersionClick() {
  clicks.value++
  const isUnlockClick = clicks.value === 5

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    versionButton.value?.animate(
      isUnlockClick
        ? [
            { transform: 'scale(1)' },
            { transform: 'scale(1.2) rotate(-4deg)', offset: 0.35 },
            { transform: 'scale(1.15) rotate(4deg)', offset: 0.65 },
            { transform: 'scale(1)' },
          ]
        : [
            { transform: 'scale(1)' },
            { transform: 'scale(1.08)' },
            { transform: 'scale(1)' },
          ],
      { duration: isUnlockClick ? 700 : 350, easing: 'ease-out' },
    )
  }

  if (isUnlockClick) {
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
  <div class="version-controls">
    <button
      ref="versionButton"
      type="button"
      :class="{ 'version-unlocked': showReset }"
      class="version"
      @click="handleVersionClick"
    >
      Version {{ version }}
    </button>
    <button v-if="showReset" class="reset-btn" @click="resetAll">✦ Alles zurücksetzen</button>
  </div>
</template>

<style scoped>
.version-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

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
  margin-top: var(--space-2);
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
  color: var(--color-gold);
}
</style>
