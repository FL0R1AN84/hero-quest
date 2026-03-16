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
  <p class="text-sm" :class="{ 'version-unlocked': showReset }" style="cursor: default; user-select: none" @click="handleVersionClick">Version {{ version }}</p>
  <button v-if="showReset" class="reset-btn" @click="resetAll">✦ Alles zurücksetzen</button>
</template>

<style scoped>
.reset-btn {
  margin-top: 0.5rem;
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hq-btn-reset-text);
  background: transparent;
  border: 1px solid var(--hq-btn-reset-border);
  padding: 0.35rem 0.75rem;
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
  0%   { transform: translateX(0); }
  15%  { transform: translateX(-4px) rotate(-1deg); }
  30%  { transform: translateX(4px) rotate(1deg); }
  45%  { transform: translateX(-3px); }
  60%  { transform: translateX(3px); }
  75%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}
</style>
