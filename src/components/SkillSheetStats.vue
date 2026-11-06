<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { defaultStats, specialItemOptions } from '@/data/skillSheetData'
import type { SpecialItemOption } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const {
  character,
  attackDice,
  defenseDice,
  bodyStrength,
  intelligence,
  druideShapeShifted,
  equippedSpecialItems,
  usedSpecialItems,
  itemQuantities,
  itemChargesUsed,
} = storeToRefs(store)

const isDruideInWolfForm = computed(() => character.value === 'Druide' && druideShapeShifted.value)
const minimumAttackDice = computed(() => (isDruideInWolfForm.value ? 3 : 1))
const minimumDefenseDice = computed(() => (isDruideInWolfForm.value ? 2 : 1))

const effectiveAttackDice = computed({
  get: () =>
    Math.max(minimumAttackDice.value, (attackDice.value ?? 0) + store.weaponBonus + (isDruideInWolfForm.value ? 1 : 0)),
  set: (v: number) => {
    attackDice.value = v - store.weaponBonus - (isDruideInWolfForm.value ? 1 : 0)
  },
})

const effectiveDefenseDice = computed({
  get: () =>
    Math.max(
      minimumDefenseDice.value,
      (defenseDice.value ?? 0) + store.armorBonus + (isDruideInWolfForm.value ? 1 : 0),
    ),
  set: (v: number) => {
    defenseDice.value = v - store.armorBonus - (isDruideInWolfForm.value ? 1 : 0)
  },
})

const effectiveIntelligence = computed({
  get: () => (intelligence.value ?? 0) + store.intelligenceBonus,
  set: (v: number) => {
    intelligence.value = v - store.intelligenceBonus
  },
})

const isDead = computed(() => character.value !== '' && (bodyStrength.value ?? 0) === 0)

// Druide kann Gestalt wechseln nur bei maximaler Körperkraft (6) oder höher
const maxDruideBodyStrength = computed(() => defaultStats['Druide']?.bodyStrength ?? 6)
const canToggleDruideShape = computed(
  () => character.value === 'Druide' && (bodyStrength.value ?? 0) >= maxDruideBodyStrength.value,
)

function changeAttack(delta: number) {
  effectiveAttackDice.value = Math.min(6, Math.max(minimumAttackDice.value, effectiveAttackDice.value + delta))
}

function changeDefense(delta: number) {
  effectiveDefenseDice.value = Math.min(6, Math.max(minimumDefenseDice.value, effectiveDefenseDice.value + delta))
}

function changeBodyStrength(delta: number) {
  if (bodyStrength.value === null) return
  const newValue = Math.max(0, bodyStrength.value + delta)

  // Wenn Körperkraft sinkt und Gestalt aktiv ist, deaktiviere die Gestalt
  if (delta < 0 && druideShapeShifted.value) {
    store.deactivateDruideShape()
  }

  bodyStrength.value = newValue
}

function changeIntelligence(delta: number) {
  if (!character.value) return
  effectiveIntelligence.value = Math.max(0, effectiveIntelligence.value + delta)
}

// ── Revive dialog state ────────────────────────────────
const revivePoints = ref(1)
const maxRevivePoints = computed(() => defaultStats[character.value]?.bodyStrength ?? 1)
const selectedHealPotion = ref<string | null>(null)
const potionDialogType = ref<'select' | 'roll' | null>(null) // 'select' für Würfel-Heiltrank
const healRolled = ref(1)

// ── Available healing potions ───────────────────────────
const healPotionKinds = new Set(['heal-fixed', 'heal-potion'])

const availableHealPotions = computed(() => {
  return equippedSpecialItems.value
    .filter((id) => {
      if (usedSpecialItems.value.includes(id)) return false
      const item = specialItemOptions.find((i) => i.id === id)
      return item && healPotionKinds.has(item.kind ?? '')
    })
    .map((id) => specialItemOptions.find((i) => i.id === id))
    .filter((item): item is SpecialItemOption => !!item)
})

function canUseHealing(item: SpecialItemOption): boolean {
  const qty = itemQuantities.value[item.id] ?? 1
  return qty > 0
}

function getHealingAmount(item: SpecialItemOption): string {
  if (item.kind === 'heal-fixed') return '+4'
  if (item.kind === 'heal-potion') return '1W6'
  return '?'
}

// ── Use healing potion before revive ────────────────────
function useHealingPotion(id: string) {
  const item = specialItemOptions.find((i) => i.id === id)
  if (!item) return

  selectedHealPotion.value = id

  // Würfel-Heiltrank: Dialog für Würfelresultat
  if (item.kind === 'heal-potion') {
    potionDialogType.value = 'roll'
    healRolled.value = 1
  } else {
    // +4 Heiltrank: direkt anwenden
    applyFixedHealing(id)
  }
}

function applyFixedHealing(id: string) {
  if (bodyStrength.value === null || !character.value) return
  const startBs = defaultStats[character.value]?.bodyStrength ?? bodyStrength.value
  bodyStrength.value = Math.min(startBs, bodyStrength.value + 4)

  // Verbrauche den Trank
  consumePotion(id)
  selectedHealPotion.value = null
  potionDialogType.value = null
}

function applyRollHealing(id: string) {
  if (bodyStrength.value === null || !character.value) return
  const startBs = defaultStats[character.value]?.bodyStrength ?? bodyStrength.value
  const heal = Math.min(healRolled.value, startBs - bodyStrength.value)
  bodyStrength.value = bodyStrength.value + Math.max(0, heal)

  // Verbrauche den Trank
  consumePotion(id)
  selectedHealPotion.value = null
  potionDialogType.value = null
}

function consumePotion(id: string) {
  const current = itemQuantities.value[id] ?? 1
  const next = current - 1
  if (next <= 0) {
    const updated = { ...itemQuantities.value }
    delete updated[id]
    itemQuantities.value = updated
    if (!usedSpecialItems.value.includes(id)) {
      usedSpecialItems.value.push(id)
    }
  } else {
    itemQuantities.value = { ...itemQuantities.value, [id]: next }
  }
}

function cancelPotion() {
  selectedHealPotion.value = null
  potionDialogType.value = null
  healRolled.value = 1
}

// ── Revive without healing ──────────────────────────────
function revive() {
  if (bodyStrength.value === null) return
  bodyStrength.value = Math.min(maxRevivePoints.value, Math.max(1, revivePoints.value))
  revivePoints.value = 1
  druideShapeShifted.value = false
}

// ── Sterben / Zurück zur Übersicht mit dramatischer Animation ─
const suppressDeathOverlay = ref(false)

function skipRevive() {
  // legacy alias – keep behavior consistent with previous name
  dieAndReturn()
}

function dieAndReturn() {
  // Suppress the death overlay so the UI returns to the main overview
  suppressDeathOverlay.value = true

  // Ensure global animation styles exist and play animation on the main .card element
  ensureDeathAnimationStyles()
  const card = document.querySelector('.card') as HTMLElement | null
  if (card) {
    card.classList.add('hero-death-anim')
  }

  // Create a dramatic full-screen skull flash
  const flash = createDeathFlash()
  document.body.appendChild(flash)

  const duration = 1400
  setTimeout(() => {
    if (card) card.classList.remove('hero-death-anim')
    if (flash && flash.parentElement) flash.parentElement.removeChild(flash)
  }, duration)
}

// When bodyStrength becomes > 0 again, re-enable the overlay for future deaths
watch(bodyStrength, (v) => {
  if ((v ?? 0) > 0) suppressDeathOverlay.value = false
})

function ensureDeathAnimationStyles() {
  if (document.getElementById('hq-death-anim-styles')) return
  const css = `
  .card.hero-death-anim {
    animation: hq-death 1.2s ease both;
  }
  @keyframes hq-death {
    0% { transform: translateY(0) scale(1); filter: none; }
    30% { transform: translateY(-8px) rotate(-3deg) scale(1.03); filter: drop-shadow(0 0 24px var(--color-death-shadow)) saturate(1.2); }
    60% { transform: translateY(8px) rotate(3deg) scale(0.98); filter: grayscale(1) blur(0.6px); }
    100% { transform: scale(1); filter: grayscale(1) opacity(0.6); }
  }
  .hq-death-flash {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    background: radial-gradient(circle at center, color-mix(in srgb, var(--color-death-overlay) 95%, transparent), color-mix(in srgb, var(--color-black) 70%, transparent));
    animation: hq-flash 1.2s ease both;
  }
  .hq-death-flash .skull {
    font-size: 6.5rem;
    filter: drop-shadow(0 0 32px var(--color-death-shadow));
    transform: rotate(-6deg);
  }
  @keyframes hq-flash {
    0% { opacity: 0; transform: scale(0.95); }
    20% { opacity: 1; transform: scale(1.05); }
    80% { opacity: 1; }
    100% { opacity: 0; transform: scale(1); }
  }
  `
  const el = document.createElement('style')
  el.id = 'hq-death-anim-styles'
  el.innerHTML = css
  document.head.appendChild(el)
}

function createDeathFlash() {
  const el = document.createElement('div')
  el.className = 'hq-death-flash'
  el.innerHTML = `<div class="skull">💀</div>`
  return el
}
</script>

<template>
  <!-- Death overlay -->
  <div v-if="isDead && !suppressDeathOverlay" class="death-overlay" @click.stop>
    <div class="death-content">
      <div class="death-skull">💀</div>
      <div class="death-text">Der Held ist gefallen!</div>

      <!-- Healing potions selection -->
      <div
        v-if="availableHealPotions.length > 0 && !selectedHealPotion && potionDialogType === null"
        class="heal-potions-box"
      >
        <p class="heal-label">Verfügbare Tränke:</p>
        <div class="potions-grid">
          <button
            v-for="item in availableHealPotions"
            :key="item.id"
            :disabled="!canUseHealing(item)"
            class="potion-btn"
            @click="useHealingPotion(item.id)"
          >
            <span class="potion-symbol">{{ item.symbol }}</span>
            <span class="potion-label">{{ item.label }}</span>
            <span class="potion-amount">{{ getHealingAmount(item) }}</span>
          </button>
        </div>
      </div>

      <!-- Dice roll dialog for heal-potion -->
      <div v-if="potionDialogType === 'roll' && selectedHealPotion" class="potion-roll-dialog">
        <p class="roll-label">Würfle 1W6 oder wähle einen Wert:</p>
        <div class="roll-controls">
          <button
            v-for="val in 6"
            :key="val"
            :class="{ 'roll-btn-active': healRolled === val }"
            class="roll-btn"
            @click="healRolled = val"
          >
            {{ val }}
          </button>
        </div>
        <div class="roll-actions">
          <button class="btn-confirm" @click="applyRollHealing(selectedHealPotion)">✓ Anwenden</button>
          <button class="btn-cancel" @click="cancelPotion">✕ Abbrechen</button>
        </div>
      </div>

      <!-- Revive controls -->
      <div class="revive-box">
        <p class="revive-label">Wiederbelebung – Körperkraftpunkte:</p>
        <div class="revive-controls">
          <button :disabled="revivePoints <= 1" class="revive-adj" @click="revivePoints > 1 && revivePoints--">
            −
          </button>
          <span class="revive-value">{{ revivePoints }}</span>
          <button
            :disabled="revivePoints >= maxRevivePoints"
            class="revive-adj"
            @click="revivePoints < maxRevivePoints && revivePoints++"
          >
            +
          </button>
        </div>
        <div class="revive-actions">
          <button class="revive-btn" @click="revive">⚗️ Wiederbeleben</button>
          <button class="die-btn" @click="dieAndReturn">💀 Sterben</button>
        </div>
      </div>
    </div>
  </div>

  <div :class="{ 'is-dead': isDead }" class="stats-grid">
    <!-- Angriffswürfel: green -->
    <div class="stat-cell">
      <div class="stat-diamond-wrap">
        <button
          :disabled="!character || effectiveAttackDice <= minimumAttackDice"
          class="adj-btn adj-minus"
          @click="changeAttack(-1)"
        >
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
          :disabled="!character || effectiveDefenseDice <= minimumDefenseDice"
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

  <!-- Druide Gestalt-Wechsel Button -->
  <div v-if="character === 'Druide'" class="druide-shape-section">
    <button
      :disabled="!canToggleDruideShape"
      :class="{ 'shape-active': druideShapeShifted }"
      class="druide-shape-btn"
      @click="store.toggleDruideShape"
    >
      <span class="shape-icon">🐺</span>
      <span class="shape-text">{{ druideShapeShifted ? 'Gestalt: Aktiviert' : 'Gestalt wechseln' }}</span>
    </button>
  </div>
</template>

<style scoped>
/* 2×2 on mobile, 4×1 on wider screens */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  padding-block-start: var(--space-8);
  padding-block-end: var(--space-4);
  position: relative;
  transition: filter 0.5s;
}

.stats-grid.is-dead {
  filter: grayscale(0.6) opacity(0.5);
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.stat-diamond-wrap {
  position: relative;
  width: var(--size-stat-diamond);
  height: var(--size-stat-diamond);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* +/- buttons – positioned at the corners so they don't affect layout width */
.adj-btn {
  position: absolute;
  width: var(--size-stat-control);
  height: var(--size-stat-control);
  border-radius: var(--radius-circle);
  border: var(--border-width-default) solid var(--hq-label);
  background: var(--hq-card-bg-dark);
  color: var(--hq-label);
  font-size: var(--font-size-adjustment);
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
  width: var(--size-stat-diamond);
  height: var(--size-stat-diamond);
  border-width: var(--border-width-default);
  border-style: solid;
  background-color: var(--hq-card-bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: inset 0 2px 4px color-mix(in srgb, var(--color-black) 20%, transparent);
  transition:
    background-color 0.4s,
    border-color 0.4s;
  flex-shrink: 0;
}

.diamond-dead {
  border-color: var(--color-gray-dark) !important;
  background-color: var(--color-disabled-bg);
  animation: pulse-dead 1.5s ease-in-out infinite;
}

.diamond-input {
  transform: rotate(-45deg);
  background: transparent;
  width: var(--size-diamond-input);
  text-align: center;
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-stat-value);
  color: var(--hq-input-text);
  outline: none;
  border: none;
  transition: color 0.4s;
  padding: var(--space-1) 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-dead {
  color: var(--color-gray-darker) !important;
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
  font-size: var(--font-size-tiny);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  line-height: var(--line-height-text);
  color: var(--hq-label);
  transition: color 0.4s;
}

/* ── Death overlay ────────────────────────────────────── */
.death-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-death-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hq-overlay-strong);
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
  gap: var(--space-4);
  animation: rise 0.6s ease-out both;
  width: 100%;
  max-width: var(--size-modal-max);
  padding-inline: var(--space-6);
  box-sizing: border-box;
}

.death-skull {
  font-size: 6rem;
  filter: drop-shadow(0 0 24px var(--color-death-shadow));
  animation: shake 0.5s ease-in-out 0.6s both;
}

.death-text {
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-2xl);
  color: var(--color-death);
  text-shadow:
    0 0 16px color-mix(in srgb, var(--color-death-glow) 67%, transparent),
    0 2px 4px var(--color-black);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
}

/* ── Revive box ───────────────────────────────────────── */
.revive-box {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  background: color-mix(in srgb, var(--color-white) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-white) 12%, transparent);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  backdrop-filter: blur(2px);
  width: 100%;
  box-sizing: border-box;
}

.revive-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--color-white) 70%, transparent);
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
  border: 2px solid color-mix(in srgb, var(--color-white) 50%, transparent);
  background: transparent;
  color: var(--color-white);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.revive-adj:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-white) 15%, transparent);
}

.revive-adj:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.revive-value {
  font-family: var(--font-fantasy), serif;
  font-size: 2rem;
  color: var(--color-white);
  min-width: 2rem;
  text-align: center;
}

.revive-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
}

.revive-btn {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 2px solid var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success-light);
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.revive-btn:hover {
  background-color: var(--color-success);
  color: var(--color-black);
  box-shadow: 0 0 16px color-mix(in srgb, var(--color-success) 53%, transparent);
}

.skip-btn {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 2px solid color-mix(in srgb, var(--color-white) 30%, transparent);
  background: color-mix(in srgb, var(--color-white) 5%, transparent);
  color: color-mix(in srgb, var(--color-white) 60%, transparent);
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.skip-btn:hover {
  background-color: color-mix(in srgb, var(--color-white) 10%, transparent);
  color: color-mix(in srgb, var(--color-white) 80%, transparent);
  border-color: color-mix(in srgb, var(--color-white) 50%, transparent);
}

/* Sterben-Button (rot, Totenkopf) */
.die-btn {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 2px solid color-mix(in srgb, var(--color-danger) 80%, transparent);
  background: color-mix(in srgb, var(--color-danger) 14%, transparent);
  color: var(--color-danger-pale);
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.die-btn:hover {
  background-color: color-mix(in srgb, var(--color-danger) 28%, transparent);
  color: var(--color-white);
  border-color: var(--color-danger-strong);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-danger-strong) 35%, transparent);
}

/* ── Healing potions selection ──────────────────────────── */
.heal-potions-box {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
  border-radius: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.heal-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  color: color-mix(in srgb, var(--color-white) 65%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.potions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5.5rem, 1fr));
  gap: 0.5rem;
}

.potion-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid color-mix(in srgb, var(--color-success) 40%, transparent);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: color-mix(in srgb, var(--color-white) 75%, transparent);
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.potion-btn:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-success) 25%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 70%, transparent);
  color: var(--color-success-light);
}

.potion-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.potion-symbol {
  font-size: 1.5rem;
}

.potion-label {
  font-size: 0.65rem;
  line-height: 1.1;
  text-align: center;
  max-width: 5rem;
  word-break: break-word;
}

.potion-amount {
  font-size: 0.6rem;
  color: color-mix(in srgb, var(--color-white) 50%, transparent);
  font-weight: 600;
}

/* ── Potion roll dialog ───────────────────────────────── */
.potion-roll-dialog {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: color-mix(in srgb, var(--color-blue-highlight) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-blue-highlight) 25%, transparent);
  border-radius: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.roll-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--color-white) 70%, transparent);
  text-align: center;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
}

.roll-controls {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.4rem;
}

.roll-btn {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--color-blue-highlight) 40%, transparent);
  background: color-mix(in srgb, var(--color-blue-highlight) 5%, transparent);
  color: color-mix(in srgb, var(--color-white) 60%, transparent);
  border-radius: 0.3rem;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.roll-btn:hover {
  background: color-mix(in srgb, var(--color-blue-highlight) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-blue-highlight) 70%, transparent);
  color: color-mix(in srgb, var(--color-white) 85%, transparent);
}

.roll-btn-active {
  background: color-mix(in srgb, var(--color-blue-highlight) 35%, transparent) !important;
  border-color: var(--color-blue-highlight) !important;
  color: var(--color-white) !important;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-blue-highlight) 40%, transparent);
}

.roll-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.btn-confirm {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
  background: color-mix(in srgb, var(--color-success) 20%, transparent);
  color: var(--color-success-light);
  font-family: var(--font-fantasy), serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.btn-confirm:hover {
  background: color-mix(in srgb, var(--color-success) 35%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 80%, transparent);
}

.btn-cancel {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid color-mix(in srgb, var(--color-danger-strong) 40%, transparent);
  background: color-mix(in srgb, var(--color-danger-strong) 8%, transparent);
  color: color-mix(in srgb, var(--color-danger-soft) 80%, transparent);
  font-family: var(--font-fantasy), serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.btn-cancel:hover {
  background: color-mix(in srgb, var(--color-danger-strong) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-danger-strong) 70%, transparent);
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
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--color-black) 20%, transparent);
  }
  50% {
    box-shadow:
      inset 0 2px 4px color-mix(in srgb, var(--color-black) 20%, transparent),
      0 0 10px 2px var(--color-death-shadow);
  }
}

/* ── Druide Gestalt-Wechsel ────────────────────────────────── */
.druide-shape-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: color-mix(in srgb, var(--color-success-strong) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success-strong) 30%, transparent);
  border-radius: 4px;
  transition: all 0.3s;
}

.druide-shape-section:has(.shape-active) {
  background-color: color-mix(in srgb, var(--color-success-strong) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-success-strong) 60%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-success-strong) 20%, transparent);
}

.druide-shape-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: color-mix(in srgb, var(--color-success-strong) 10%, transparent);
  border: 2px solid color-mix(in srgb, var(--color-success-strong) 40%, transparent);
  border-radius: 4px;
  color: var(--color-success-strong);
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.druide-shape-btn:hover {
  background-color: color-mix(in srgb, var(--color-success-strong) 20%, transparent);
  border-color: color-mix(in srgb, var(--color-success-strong) 70%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-success-strong) 30%, transparent);
}

.druide-shape-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  color: var(--color-gray);
  border-color: color-mix(in srgb, var(--color-success-strong) 20%, transparent);
  background-color: color-mix(in srgb, var(--color-success-strong) 4%, transparent);
}

.druide-shape-btn.shape-active {
  background-color: color-mix(in srgb, var(--color-success-strong) 25%, transparent);
  border-color: var(--color-success-strong);
  color: var(--color-success-strong-text);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-success-strong) 40%, transparent);
}

.shape-icon {
  font-size: 1.25rem;
  display: inline-block;
}

.shape-text {
  flex: 1;
}
</style>
