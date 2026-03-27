<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { weaponOptions, armorOptions, specialItemOptions } from '@/data/skillSheetData'
import type { WeaponOption, SpecialItemOption } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { character, equippedWeapon, equippedArmor, equippedSpecialItems, usedSpecialItems } =
  storeToRefs(store)

// ── Restriction helpers ───────────────────────────────────
function canEquipWeapon(w: WeaponOption): boolean {
  if (character.value === 'Zauberer') return false
  return !w.allowedCharacters || w.allowedCharacters.includes(character.value)
}

function canEquipArmor(a: { allowedCharacters: string[] | null }): boolean {
  return !a.allowedCharacters || a.allowedCharacters.includes(character.value)
}

function canEquipSpecialItem(item: SpecialItemOption): boolean {
  return !item.allowedCharacters || item.allowedCharacters.includes(character.value)
}

// ── Filtered lists ────────────────────────────────────────
const visibleWeapons = computed(() => weaponOptions.filter(canEquipWeapon))
const visibleArmor = computed(() => armorOptions.filter(canEquipArmor))
const visibleSpecialItems = computed(() => specialItemOptions.filter(canEquipSpecialItem))

// ── Toggle helpers ────────────────────────────────────────
function toggleWeapon(id: string) {
  const w = weaponOptions.find((w) => w.id === id)
  if (!w || !canEquipWeapon(w)) return
  const idx = equippedWeapon.value.indexOf(id)
  if (idx >= 0) equippedWeapon.value.splice(idx, 1)
  else if (equippedWeapon.value.length < 2) equippedWeapon.value.push(id)
}

function toggleArmor(id: string) {
  const a = armorOptions.find((a) => a.id === id)
  if (!a || !canEquipArmor(a)) return
  const idx = equippedArmor.value.indexOf(id)
  if (idx >= 0) equippedArmor.value.splice(idx, 1)
  else equippedArmor.value.push(id)
}

function toggleSpecialItem(id: string) {
  if (usedSpecialItems.value.includes(id)) return
  const item = specialItemOptions.find((i) => i.id === id)
  if (!item || !canEquipSpecialItem(item)) return
  const idx = equippedSpecialItems.value.indexOf(id)
  if (idx >= 0) equippedSpecialItems.value.splice(idx, 1)
  else equippedSpecialItems.value.push(id)
}

const animatingItems = ref<string[]>([])

function markItemUsed(id: string) {
  if (!usedSpecialItems.value.includes(id)) {
    animatingItems.value.push(id)
    usedSpecialItems.value.push(id)
    setTimeout(() => {
      const idx = animatingItems.value.indexOf(id)
      if (idx >= 0) animatingItems.value.splice(idx, 1)
    }, 900)
  }
}

function resetItemUsed(id: string) {
  const idx = usedSpecialItems.value.indexOf(id)
  if (idx >= 0) usedSpecialItems.value.splice(idx, 1)
}
</script>

<template>
  <!-- Section header -->
  <div class="equip-section-header">
    <div class="divider-line"></div>
    <span class="sword-ornament">⚔️</span>
    <span class="equip-section-title">Ausrüstung</span>
    <span class="sword-ornament">🛡</span>
    <div class="divider-line"></div>
  </div>

  <!-- Waffen -->
  <div v-if="character !== 'Zauberer'" class="equip-block">
    <div class="equip-block-header">
      <span class="equip-block-label">Waffen</span>
      <span :class="store.weaponBonus > 0 ? 'equip-badge--attack-active' : 'equip-badge--inactive'" class="equip-badge"
        >+{{ store.weaponBonus }} ⚔</span
      >
    </div>
    <div class="equip-list">
      <div v-if="!character" class="equip-item equip-item--placeholder">
        <span class="equip-item-placeholder">Wähle einen Charakter, um die Ausrüstung anzuzeigen</span>
      </div>
      <template v-else>
        <button
          v-for="w in visibleWeapons"
          :key="w.id"
          :class="{
            'equip-item--selected': equippedWeapon.includes(w.id),
            'equip-item--disabled': !equippedWeapon.includes(w.id) && equippedWeapon.length >= 2,
          }"
          class="equip-item"
          type="button"
          @click="toggleWeapon(w.id)"
        >
          <span class="equip-item-icon">⚔</span>
          <span class="equip-item-content">
            <span class="equip-item-name">{{ w.label }}</span>
            <span v-if="w.note" class="equip-item-note">{{ w.note }}</span>
          </span>
          <span class="equip-item-bonus">+{{ w.bonus }}</span>
          <span v-if="equippedWeapon.includes(w.id)" class="equip-item-check">✓</span>
        </button>
      </template>
    </div>
  </div>

  <!-- Rüstung -->
  <div class="equip-block">
    <div class="equip-block-header">
      <span class="equip-block-label">Rüstung</span>
      <span :class="store.armorBonus > 0 ? 'equip-badge--defense-active' : 'equip-badge--inactive'" class="equip-badge"
        >+{{ store.armorBonus }} 🛡</span
      >
    </div>
    <div class="equip-list">
      <div v-if="!character" class="equip-item equip-item--placeholder">
        <span class="equip-item-placeholder">Wähle einen Charakter, um die Ausrüstung anzuzeigen</span>
      </div>
      <template v-else>
        <button
          v-for="a in visibleArmor"
          :key="a.id"
          :class="{ 'equip-item--selected equip-item--armor': equippedArmor.includes(a.id) }"
          class="equip-item"
          type="button"
          @click="toggleArmor(a.id)"
        >
          <span class="equip-item-icon">🛡</span>
          <span class="equip-item-content">
            <span class="equip-item-name">{{ a.label }}</span>
          </span>
          <span :class="{ 'equip-item-bonus--armor': equippedArmor.includes(a.id) }" class="equip-item-bonus"
            >+{{ a.bonus }}</span
          >
          <span v-if="equippedArmor.includes(a.id)" class="equip-item-check equip-item-check--armor">✓</span>
        </button>
      </template>
    </div>
  </div>

  <!-- Gegenstände -->
  <div v-if="visibleSpecialItems.length > 0" class="equip-block">
    <div class="equip-block-header">
      <span class="equip-block-label">Gegenstände</span>
    </div>
    <div class="equip-list">
      <div
        v-for="item in visibleSpecialItems"
        :key="item.id"
        :class="{
          'equip-item--selected': equippedSpecialItems.includes(item.id) && !usedSpecialItems.includes(item.id),
          'equip-item--used': usedSpecialItems.includes(item.id),
          'equip-item--magic-flash': animatingItems.includes(item.id),
        }"
        class="equip-item equip-item--special-wrap"
      >
        <button
          :disabled="usedSpecialItems.includes(item.id)"
          class="equip-item-toggle"
          type="button"
          @click.stop="toggleSpecialItem(item.id)"
        >
          <span class="equip-item-icon">{{ item.symbol }}</span>
          <span class="equip-item-content">
            <span class="equip-item-name">{{ item.label }}</span>
            <span class="equip-item-note">{{ item.ability }}</span>
          </span>
          <span
            v-if="equippedSpecialItems.includes(item.id) && !usedSpecialItems.includes(item.id)"
            class="equip-item-check"
            >✓</span
          >
          <span v-if="usedSpecialItems.includes(item.id)" class="equip-item-used-badge">✕ BENUTZT</span>
        </button>
        <button
          v-if="equippedSpecialItems.includes(item.id) && !usedSpecialItems.includes(item.id)"
          class="btn-use-item"
          type="button"
          @click="markItemUsed(item.id)"
        >
          ✦ Benutzen
        </button>
        <button
          v-if="usedSpecialItems.includes(item.id)"
          class="btn-restore-item"
          type="button"
          @click="resetItemUsed(item.id)"
        >
          ↺ Wiederherstellen
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.equip-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.equip-section-title {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hq-subtitle);
  white-space: nowrap;
  transition: color 0.4s;
}

.equip-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-block: 0.25rem;
}

.equip-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.equip-block-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hq-label);
  transition: color 0.4s;
}

.equip-badge {
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  border-radius: 99px;
  padding: 0.1rem 0.5rem;
  border: 1px solid;
  transition:
    color 0.3s,
    border-color 0.3s,
    background-color 0.3s;
}

.equip-badge--inactive {
  color: var(--hq-hint);
  border-color: var(--hq-divider);
  background-color: transparent;
}

.equip-badge--attack-active {
  color: var(--color-green);
  border-color: var(--color-green);
  background-color: color-mix(in srgb, var(--color-green) 12%, transparent);
}

.equip-badge--defense-active {
  color: var(--color-yellow);
  border-color: var(--color-yellow);
  background-color: color-mix(in srgb, var(--color-yellow) 12%, transparent);
}

.equip-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.equip-item {
  width: 100%;
  background-color: var(--hq-card-bg-dark);
  border: 1px solid var(--hq-input-border);
  border-radius: 2px;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.equip-item--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-style: dashed;
  cursor: default;
}

.equip-item-placeholder {
  font-family: var(--font-body), serif;
  font-style: italic;
  font-size: 0.7rem;
  color: var(--hq-input-placeholder);
  text-align: center;
}

button.equip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  min-height: 2.75rem;
}

.equip-item--selected {
  border-color: var(--color-green);
  background-color: color-mix(in srgb, var(--color-green) 8%, var(--hq-card-bg-dark));
}

.equip-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.equip-item--armor.equip-item--selected {
  border-color: var(--color-yellow);
  background-color: color-mix(in srgb, var(--color-yellow) 8%, var(--hq-card-bg-dark));
}

.equip-item--used {
  opacity: 0.5;
  border-style: dashed;
  cursor: default;
}

.equip-item-icon {
  font-size: 1rem;
  line-height: 1.4;
  flex-shrink: 0;
}

.equip-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.equip-item-name {
  font-family: var(--font-fantasy), serif;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  color: var(--hq-input-text);
  transition: color 0.4s;
}

.equip-item-note {
  font-family: var(--font-body), serif;
  font-style: italic;
  font-size: 0.65rem;
  color: var(--hq-hint);
  line-height: 1.3;
  transition: color 0.4s;
}

.equip-item-bonus {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--hq-hint);
  flex-shrink: 0;
  align-self: center;
  transition: color 0.3s;
}

.equip-item--selected .equip-item-bonus {
  color: var(--color-green);
}

.equip-item--armor.equip-item--selected .equip-item-bonus,
.equip-item-bonus--armor {
  color: var(--color-yellow);
}

.equip-item-check {
  font-size: 0.85rem;
  color: var(--color-green);
  flex-shrink: 0;
  align-self: center;
  font-weight: bold;
}

.equip-item-check--armor {
  color: var(--color-yellow);
}

.equip-item-used-badge {
  font-family: var(--font-fantasy), serif;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  color: var(--hq-hint);
  flex-shrink: 0;
  align-self: center;
}

.equip-item--special-wrap {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.equip-item-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  min-height: 2.75rem;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.equip-item-toggle:disabled {
  cursor: default;
}

.btn-use-item {
  width: 100%;
  font-family: var(--font-fantasy), serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background-color: color-mix(in srgb, var(--color-blue) 18%, var(--hq-card-bg-dark));
  color: var(--color-blue);
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--color-blue) 30%, transparent);
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-use-item:hover {
  background-color: color-mix(in srgb, var(--color-blue) 28%, var(--hq-card-bg-dark));
}

.btn-use-item:active {
  transform: scale(0.98);
}

.btn-restore-item {
  width: 100%;
  font-family: var(--font-fantasy), serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background-color: color-mix(in srgb, var(--hq-hint) 12%, var(--hq-card-bg-dark));
  color: var(--hq-hint);
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--hq-hint) 20%, transparent);
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-restore-item:hover {
  background-color: color-mix(in srgb, var(--hq-hint) 22%, var(--hq-card-bg-dark));
  color: var(--hq-input-text);
}

.btn-restore-item:active {
  transform: scale(0.98);
}

/* ── Magic item use effect ──────────────────────────────── */
@keyframes magic-flash {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
    border-color: var(--color-blue);
  }
  15% {
    opacity: 1;
    transform: scale(1.04);
    box-shadow:
      0 0 12px 4px color-mix(in srgb, var(--color-blue) 60%, transparent),
      0 0 32px 8px color-mix(in srgb, var(--color-blue) 30%, transparent);
    border-color: var(--color-blue);
  }
  40% {
    opacity: 1;
    transform: scale(1.02);
    box-shadow:
      0 0 20px 6px color-mix(in srgb, var(--color-blue) 50%, transparent),
      0 0 48px 12px color-mix(in srgb, var(--color-blue) 20%, transparent);
  }
  70% {
    opacity: 0.7;
    transform: scale(1.01);
    box-shadow: 0 0 8px 2px color-mix(in srgb, var(--color-blue) 25%, transparent);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
    box-shadow: none;
  }
}

.equip-item--magic-flash {
  animation: magic-flash 0.9s ease-out forwards;
  border-color: var(--color-blue) !important;
  background-color: color-mix(in srgb, var(--color-blue) 12%, var(--hq-card-bg-dark)) !important;
  z-index: 1;
  position: relative;
}
</style>

