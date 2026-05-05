<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'

const store = useSkillSheetStore()
const { character, attackDice, defenseDice, bodyStrength, intelligence } = storeToRefs(store)

const effectiveAttackDice = computed({
  get: () => (attackDice.value ?? 0) + store.weaponBonus,
  set: (v: number) => {
    attackDice.value = v - store.weaponBonus
  },
})

const effectiveDefenseDice = computed({
  get: () => (defenseDice.value ?? 0) + store.armorBonus,
  set: (v: number) => {
    defenseDice.value = v - store.armorBonus
  },
})

const effectiveIntelligence = computed({
  get: () => (intelligence.value ?? 0) + store.intelligenceBonus,
  set: (v: number) => {
    intelligence.value = v - store.intelligenceBonus
  },
})

const isDead = computed(() => character.value !== '' && (bodyStrength.value ?? 0) === 0)

function changeAttack(delta: number) {
  effectiveAttackDice.value = Math.min(6, Math.max(1, effectiveAttackDice.value + delta))
}

function changeDefense(delta: number) {
  effectiveDefenseDice.value = Math.min(6, Math.max(1, effectiveDefenseDice.value + delta))
}

function changeBodyStrength(delta: number) {
  if (bodyStrength.value === null) return
  bodyStrength.value = Math.max(0, bodyStrength.value + delta)
}

function changeIntelligence(delta: number) {
  if (!character.value) return
  effectiveIntelligence.value = Math.max(0, effectiveIntelligence.value + delta)
}

// Revive
const revivePoints = ref(1)

function revive() {
  if (bodyStrength.value === null) return
  bodyStrength.value = Math.max(1, revivePoints.value)
  revivePoints.value = 1
}
</script>

<template>
  <!-- Death overlay -->
  <div v-if="isDead" class="death-overlay" @click.stop>
    <div class="death-content">
      <div class="death-skull">💀</div>
      <div class="death-text">Der Held ist gefallen!</div>
      <div class="revive-box">
        <p class="revive-label">Wiederbelebung – Körperkraftpunkte wiederherstellen:</p>
        <div class="revive-controls">
          <button :disabled="revivePoints <= 1" class="revive-adj" @click="revivePoints > 1 && revivePoints--">
            −
          </button>
          <span class="revive-value">{{ revivePoints }}</span>
          <button class="revive-adj" @click="revivePoints++">+</button>
        </div>
        <button class="revive-btn" @click="revive">⚗️ Wiederbeleben</button>
      </div>
    </div>
  </div>

  <div :class="{ 'is-dead': isDead }" class="stats-grid">
    <!-- Angriffswürfel: green -->
    <div class="stat-cell">
      <div class="stat-diamond-wrap">
        <button :disabled="!character || effectiveAttackDice <= 1" class="adj-btn adj-minus" @click="changeAttack(-1)">
          −
        </button>
        <div class="diamond" style="border-color: var(--color-green)">
          <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
          <span v-else class="diamond-input">{{ effectiveAttackDice }}</span>
        </div>
        <button :disabled="!character || effectiveAttackDice >= 6" class="adj-btn adj-plus" @click="changeAttack(+1)">
          +
        </button>
      </div>
      <label class="stat-label">Angriffs-<br />würfel</label>
    </div>

    <!-- Verteidigungswürfel: yellow -->
    <div class="stat-cell">
      <div class="stat-diamond-wrap">
        <button
          :disabled="!character || effectiveDefenseDice <= 1"
          class="adj-btn adj-minus"
          @click="changeDefense(-1)"
        >
          −
        </button>
        <div class="diamond" style="border-color: var(--color-yellow)">
          <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
          <span v-else class="diamond-input">{{ effectiveDefenseDice }}</span>
        </div>
        <button :disabled="!character || effectiveDefenseDice >= 6" class="adj-btn adj-plus" @click="changeDefense(+1)">
          +
        </button>
      </div>
      <label class="stat-label">Verteidi-<br />gungs-<br />würfel</label>
    </div>

    <!-- Körperkraft: red -->
    <div class="stat-cell">
      <div class="stat-diamond-wrap">
        <button
          :disabled="bodyStrength === null || bodyStrength <= 0"
          class="adj-btn adj-minus"
          @click="changeBodyStrength(-1)"
        >
          −
        </button>
        <div :class="{ 'diamond-dead': isDead }" class="diamond" style="border-color: var(--color-red)">
          <span v-if="bodyStrength === null" class="diamond-input diamond-placeholder">–</span>
          <span v-else :class="{ 'text-dead': isDead }" class="diamond-input">{{ bodyStrength }}</span>
        </div>
        <button :disabled="bodyStrength === null" class="adj-btn adj-plus" @click="changeBodyStrength(+1)">+</button>
      </div>
      <label class="stat-label">Körper-<br />kraft</label>
    </div>

    <!-- Intelligenz: blue -->
    <div class="stat-cell">
      <div class="stat-diamond-wrap">
        <button
          :disabled="!character || effectiveIntelligence <= 0"
          class="adj-btn adj-minus"
          @click="changeIntelligence(-1)"
        >
          −
        </button>
        <div class="diamond" style="border-color: var(--color-blue)">
          <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
          <span v-else class="diamond-input">{{ effectiveIntelligence }}</span>
        </div>
        <button :disabled="!character" class="adj-btn adj-plus" @click="changeIntelligence(+1)">+</button>
      </div>
      <label class="stat-label">Intelli-<br />genz</label>
    </div>
  </div>
</template>

<style scoped>
/* 2×2 on mobile, 4×1 on wider screens */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1rem;
  padding-block-start: 2rem;
  padding-block-end: 1rem;
  position: relative;
  transition: filter 0.5s;
}

.stats-grid.is-dead {
  filter: grayscale(0.6) opacity(0.5);
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.stat-diamond-wrap {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* +/- buttons – positioned at the corners so they don't affect layout width */
.adj-btn {
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid var(--hq-label);
  background: var(--hq-card-bg-dark, #1a1a1a);
  color: var(--hq-label);
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    color 0.2s,
    opacity 0.2s;
  z-index: 1;
}

.adj-minus {
  bottom: -0.5rem;
  left: -0.5rem;
}

.adj-plus {
  top: -0.5rem;
  right: -0.5rem;
}

.adj-btn:hover:not(:disabled) {
  background-color: var(--hq-label);
  color: var(--hq-card-bg-dark);
}

.adj-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.diamond {
  width: 4.5rem;
  height: 4.5rem;
  border-width: 2px;
  border-style: solid;
  background-color: var(--hq-card-bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition:
    background-color 0.4s,
    border-color 0.4s;
  flex-shrink: 0;
}

.diamond-dead {
  border-color: #666 !important;
  background-color: #1a1a1a;
  animation: pulse-dead 1.5s ease-in-out infinite;
}

.diamond-input {
  transform: rotate(-45deg);
  background: transparent;
  width: 2.75rem;
  text-align: center;
  font-family: var(--font-fantasy), serif;
  font-size: 1.375rem;
  color: var(--hq-input-text);
  outline: none;
  border: none;
  transition: color 0.4s;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-dead {
  color: #555 !important;
}

.diamond-input::placeholder {
  color: var(--hq-input-placeholder);
}

.diamond-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hq-input-placeholder);
  pointer-events: none;
  user-select: none;
}

.stat-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.4;
  color: var(--hq-label);
  transition: color 0.4s;
}

/* ── Death overlay ────────────────────────────────────── */
.death-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(4px);
  animation: overlay-in 0.4s ease both;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.death-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: rise 0.6s ease-out both;
  width: 100%;
  max-width: 28rem;
  padding-inline: 1.5rem;
  box-sizing: border-box;
}

.death-skull {
  font-size: 6rem;
  filter: drop-shadow(0 0 24px #b00);
  animation: shake 0.5s ease-in-out 0.6s both;
}

.death-text {
  font-family: var(--font-fantasy), serif;
  font-size: 2rem;
  color: #cc2222;
  text-shadow:
    0 0 16px #ff0000aa,
    0 2px 4px #000;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
}

/* ── Revive box ───────────────────────────────────────── */
.revive-box {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(2px);
  width: 100%;
  box-sizing: border-box;
}

.revive-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.revive-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.revive-adj {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.revive-adj:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.revive-adj:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.revive-value {
  font-family: var(--font-fantasy), serif;
  font-size: 2rem;
  color: #fff;
  min-width: 2rem;
  text-align: center;
}

.revive-btn {
  margin-top: 0.25rem;
  padding: 0.55rem 1.4rem;
  border-radius: 2rem;
  border: 2px solid #4caf50;
  background: rgba(76, 175, 80, 0.15);
  color: #88dd8a;
  font-family: var(--font-fantasy), serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.revive-btn:hover {
  background-color: #4caf50;
  color: #000;
  box-shadow: 0 0 16px #4caf5088;
}

/* Transitions – handled via overlay-in keyframe, no Transition component needed */

@keyframes rise {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  40% {
    transform: rotate(8deg);
  }
  60% {
    transform: rotate(-5deg);
  }
  80% {
    transform: rotate(5deg);
  }
}

@keyframes pulse-dead {
  0%,
  100% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 10px 2px #b00;
  }
}
</style>
