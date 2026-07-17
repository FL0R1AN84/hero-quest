<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { defaultStats, specialItemOptions } from '@/data/skillSheetData'
import type { SpecialItemOption } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { character, attackDice, defenseDice, bodyStrength, intelligence, druideShapeShifted, equippedSpecialItems, usedSpecialItems, itemQuantities, itemChargesUsed } = storeToRefs(store)

const effectiveAttackDice = computed({
  get: () => (attackDice.value ?? 0) + store.weaponBonus + store.druideShapeBonus,
  set: (v: number) => {
    attackDice.value = v - store.weaponBonus - store.druideShapeBonus
  },
})

const effectiveDefenseDice = computed({
  get: () => (defenseDice.value ?? 0) + store.armorBonus + store.druideShapeBonus,
  set: (v: number) => {
    defenseDice.value = v - store.armorBonus - store.druideShapeBonus
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
  effectiveAttackDice.value = Math.min(6, Math.max(1, effectiveAttackDice.value + delta))
}

function changeDefense(delta: number) {
  effectiveDefenseDice.value = Math.min(6, Math.max(1, effectiveDefenseDice.value + delta))
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
    30% { transform: translateY(-8px) rotate(-3deg) scale(1.03); filter: drop-shadow(0 0 24px #b00) saturate(1.2); }
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
    background: radial-gradient(circle at center, rgba(255,240,240,0.95), rgba(0,0,0,0.7));
    animation: hq-flash 1.2s ease both;
  }
  .hq-death-flash .skull {
    font-size: 6.5rem;
    filter: drop-shadow(0 0 32px #b00);
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
      <div v-if="availableHealPotions.length > 0 && !selectedHealPotion && potionDialogType === null" class="heal-potions-box">
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
  border: 2px solid #4caf50;
  background: rgba(76, 175, 80, 0.15);
  color: #88dd8a;
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
  background-color: #4caf50;
  color: #000;
  box-shadow: 0 0 16px #4caf5088;
}

.skip-btn {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
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
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Sterben-Button (rot, Totenkopf) */
.die-btn {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 2px solid rgba(180, 60, 60, 0.8);
  background: rgba(180, 60, 60, 0.14);
  color: #ffdddd;
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
  background-color: rgba(180, 60, 60, 0.28);
  color: #fff;
  border-color: rgba(200, 50, 50, 1);
  box-shadow: 0 0 12px rgba(200,50,50,0.35);
}

/* ── Healing potions selection ──────────────────────────── */
.heal-potions-box {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.25);
  border-radius: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.heal-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.65);
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
  border: 1px solid rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.potion-btn:hover:not(:disabled) {
  background-color: rgba(76, 175, 80, 0.25);
  border-color: rgba(76, 175, 80, 0.7);
  color: #88dd8a;
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
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

/* ── Potion roll dialog ───────────────────────────────── */
.potion-roll-dialog {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(100, 150, 255, 0.08);
  border: 1px solid rgba(100, 150, 255, 0.25);
  border-radius: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.roll-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
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
  border: 1px solid rgba(100, 150, 255, 0.4);
  background: rgba(100, 150, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 0.3rem;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    all 0.2s;
}

.roll-btn:hover {
  background: rgba(100, 150, 255, 0.15);
  border-color: rgba(100, 150, 255, 0.7);
  color: rgba(255, 255, 255, 0.85);
}

.roll-btn-active {
  background: rgba(100, 150, 255, 0.35) !important;
  border-color: #6496ff !important;
  color: #fff !important;
  box-shadow: 0 0 8px rgba(100, 150, 255, 0.4);
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
  border: 1px solid rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.2);
  color: #88dd8a;
  font-family: var(--font-fantasy), serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.btn-confirm:hover {
  background: rgba(76, 175, 80, 0.35);
  border-color: rgba(76, 175, 80, 0.8);
}

.btn-cancel {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid rgba(255, 100, 100, 0.4);
  background: rgba(255, 100, 100, 0.08);
  color: rgba(255, 150, 150, 0.8);
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
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.7);
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

/* ── Druide Gestalt-Wechsel ────────────────────────────────── */
.druide-shape-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(34, 139, 34, 0.08);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 4px;
  transition: all 0.3s;
}

.druide-shape-section:has(.shape-active) {
  background-color: rgba(34, 139, 34, 0.15);
  border-color: rgba(34, 139, 34, 0.6);
  box-shadow: 0 0 12px rgba(34, 139, 34, 0.2);
}

.druide-shape-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: rgba(34, 139, 34, 0.1);
  border: 2px solid rgba(34, 139, 34, 0.4);
  border-radius: 4px;
  color: #228b22;
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
  background-color: rgba(34, 139, 34, 0.2);
  border-color: rgba(34, 139, 34, 0.7);
  box-shadow: 0 0 8px rgba(34, 139, 34, 0.3);
}

.druide-shape-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  color: #888;
  border-color: rgba(34, 139, 34, 0.2);
  background-color: rgba(34, 139, 34, 0.04);
}

.druide-shape-btn.shape-active {
  background-color: rgba(34, 139, 34, 0.25);
  border-color: #228b22;
  color: #1a6b1a;
  box-shadow: 0 0 10px rgba(34, 139, 34, 0.4);
}

.shape-icon {
  font-size: 1.25rem;
  display: inline-block;
}

.shape-text {
  flex: 1;
}
</style>
