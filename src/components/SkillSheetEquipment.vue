<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { weaponOptions, armorOptions, specialItemOptions, defaultStats } from '@/data/skillSheetData'
import type { WeaponOption, SpecialItemOption, ArmorOption } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const {
  character,
  equippedWeapon,
  equippedArmor,
  equippedSpecialItems,
  usedSpecialItems,
  itemChargesUsed,
  itemQuantities,
  attackDice,
  defenseDice,
  bodyStrength,
} = storeToRefs(store)

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

const potionKinds = new Set(['heal-fixed', 'heal-potion', 'attack-potion', 'defense-potion', 'extra-attack-same', 'movement-potion', 'restore-small', 'heal-fixed-2', 'extra-attack-multi'])
const magicKinds = new Set(['fire-shield', 'magic-ring'])

const visibleSpecialItems = computed(() =>
  specialItemOptions.filter(canEquipSpecialItem)
)

// Kategorisierung für thematische Gruppierung
function getItemCategory(item: SpecialItemOption): number {
  if (item.kind && potionKinds.has(item.kind)) return 0 // Tränke
  if (item.passive || (item.kind && magicKinds.has(item.kind)) || item.id === 'stab-der-magie' || item.id === 'ring-der-magie' || item.id === 'ring-der-rueckkehr') return 1 // Magische Items & Ringe
  return 2 // Sonstiges
}

// Für Dropdown: alphabetisch nach label
function dropdownItemComparator(a: SpecialItemOption, b: SpecialItemOption) {
  return a.label.localeCompare(b.label)
}

// Für App-Ansicht: thematisch gruppiert, innerhalb jeder Gruppe alphabetisch
function appItemComparator(a: SpecialItemOption, b: SpecialItemOption) {
  const catA = getItemCategory(a)
  const catB = getItemCategory(b)
  if (catA !== catB) return catA - catB
  return a.label.localeCompare(b.label)
}

// ── Dropdown / "nur aktive anzeigen" helpers ─────────────
import { ref as vueRef } from 'vue'

const selectedWeaponToAdd = vueRef('')
const selectedArmorToAdd = vueRef('')
const selectedSpecialToAdd = vueRef('')

const availableWeapons = computed(() =>
  visibleWeapons.value
    .filter((w) => !equippedWeapon.value.includes(w.id))
    .sort((a, b) => a.label.localeCompare(b.label))
)
const availableArmor = computed(() =>
  visibleArmor.value
    .filter((a) => !equippedArmor.value.includes(a.id))
    .sort((a, b) => a.label.localeCompare(b.label))
)
const availableSpecialItems = computed(() =>
  visibleSpecialItems.value
    .filter((i) => !equippedSpecialItems.value.includes(i.id) && !isFullyUsed(i))
    .sort(dropdownItemComparator),
)

const equippedWeaponOptions = computed(() => {
  const weapons = equippedWeapon.value.map((id) => weaponOptions.find((w) => w.id === id)).filter(Boolean) as WeaponOption[]
  return weapons.sort((a, b) => a.label.localeCompare(b.label))
})
const equippedArmorOptions = computed(() => {
  const armors = equippedArmor.value.map((id) => armorOptions.find((a) => a.id === id)).filter(Boolean) as ArmorOption[]
  return armors.sort((a, b) => a.label.localeCompare(b.label))
})

const equippedSpecialOptions = computed(() =>
  (equippedSpecialItems.value
    .map((id) => specialItemOptions.find((i) => i.id === id))
    .filter(Boolean) as SpecialItemOption[])
    .sort(appItemComparator),
)


function addWeaponFromSelect() {
  if (!selectedWeaponToAdd.value) return
  toggleWeapon(selectedWeaponToAdd.value)
  selectedWeaponToAdd.value = ''
}

function addArmorFromSelect() {
  if (!selectedArmorToAdd.value) return
  toggleArmor(selectedArmorToAdd.value)
  selectedArmorToAdd.value = ''
}

function addSpecialFromSelect() {
  if (!selectedSpecialToAdd.value) return
  toggleSpecialItem(selectedSpecialToAdd.value)
  selectedSpecialToAdd.value = ''
}

// ── Item usage helpers ────────────────────────────────────
function isFullyUsed(item: SpecialItemOption): boolean {
  if (item.maxUses) {
    return (itemChargesUsed.value[item.id] ?? 0) >= item.maxUses
  }
  return usedSpecialItems.value.includes(item.id)
}

function getChargesLeft(item: SpecialItemOption): number {
  if (!item.maxUses) return 0
  return item.maxUses - (itemChargesUsed.value[item.id] ?? 0)
}

function getChargesUsed(item: SpecialItemOption): number {
  return itemChargesUsed.value[item.id] ?? 0
}

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
  const item = specialItemOptions.find((i) => i.id === id)
  if (!item || !canEquipSpecialItem(item)) return
  if (isFullyUsed(item)) return
  const idx = equippedSpecialItems.value.indexOf(id)
  if (idx >= 0) {
    equippedSpecialItems.value.splice(idx, 1)
    if (healDialogItemId.value === id) healDialogItemId.value = null
    // Clear potion qty when removed from inventory
    if (item.kind && potionKinds.has(item.kind)) {
      const updated = { ...itemQuantities.value }
      delete updated[id]
      itemQuantities.value = updated
    }
  } else {
    equippedSpecialItems.value.push(id)
    // Init qty = 1 for potions when first added
    if (item.kind && potionKinds.has(item.kind) && !itemQuantities.value[id]) {
      itemQuantities.value = { ...itemQuantities.value, [id]: 1 }
    }
  }
}

// ── Animating state ───────────────────────────────────────
const animatingItems = ref<string[]>([])
const animatingFireItems = ref<string[]>([])

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

// Multi-charge magic item (blue flash, e.g. Ring der Magie)
function useMagicCharge(id: string) {
  const item = specialItemOptions.find((i) => i.id === id)
  if (!item?.maxUses) return
  const current = itemChargesUsed.value[id] ?? 0
  const next = current + 1
  itemChargesUsed.value = { ...itemChargesUsed.value, [id]: next }

  animatingItems.value.push(id)
  setTimeout(() => {
    const idx = animatingItems.value.indexOf(id)
    if (idx >= 0) animatingItems.value.splice(idx, 1)
  }, 900)

  if (next >= item.maxUses && !usedSpecialItems.value.includes(id)) {
    usedSpecialItems.value.push(id)
  }
}

function resetItemUsed(id: string) {
  const idx = usedSpecialItems.value.indexOf(id)
  if (idx >= 0) usedSpecialItems.value.splice(idx, 1)
  // Clear multi-charge usage
  const updated = { ...itemChargesUsed.value }
  delete updated[id]
  itemChargesUsed.value = updated
  if (healDialogItemId.value === id) healDialogItemId.value = null
  // Restore potion: set qty back to 1 and re-equip
  const item = specialItemOptions.find((i) => i.id === id)
  if (item?.kind && potionKinds.has(item.kind)) {
    itemQuantities.value = { ...itemQuantities.value, [id]: 1 }
    if (!equippedSpecialItems.value.includes(id)) {
      equippedSpecialItems.value.push(id)
    }
  }
}

// ── Potion quantity helpers ───────────────────────────────
function getPotionQuantity(id: string): number {
  return itemQuantities.value[id] ?? 1
}

function adjustPotionQuantity(id: string, delta: number) {
  const current = itemQuantities.value[id] ?? 1
  const next = current + delta
  if (next <= 0) {
    // Remove from inventory
    const updated = { ...itemQuantities.value }
    delete updated[id]
    itemQuantities.value = updated
    const idx = equippedSpecialItems.value.indexOf(id)
    if (idx >= 0) equippedSpecialItems.value.splice(idx, 1)
    if (healDialogItemId.value === id) healDialogItemId.value = null
  } else {
    itemQuantities.value = { ...itemQuantities.value, [id]: next }
    if (!equippedSpecialItems.value.includes(id)) {
      equippedSpecialItems.value.push(id)
    }
  }
}

// Use one charge from a potion; only mark "fully used" when qty hits 0
function usePotionCharge(id: string) {
  const current = itemQuantities.value[id] ?? 1
  const next = current - 1
  if (next <= 0) {
    markItemUsed(id)
    const updated = { ...itemQuantities.value }
    delete updated[id]
    itemQuantities.value = updated
  } else {
    itemQuantities.value = { ...itemQuantities.value, [id]: next }
    // flash animation without marking fully used
    animatingItems.value.push(id)
    setTimeout(() => {
      const idx = animatingItems.value.indexOf(id)
      if (idx >= 0) animatingItems.value.splice(idx, 1)
    }, 900)
  }
}

// ── Fire-shield ───────────────────────────────────────────
function useFireCharge(id: string) {
  const item = specialItemOptions.find((i) => i.id === id)
  if (!item?.maxUses) return
  const current = itemChargesUsed.value[id] ?? 0
  const next = current + 1
  itemChargesUsed.value = { ...itemChargesUsed.value, [id]: next }

  animatingFireItems.value.push(id)
  setTimeout(() => {
    const idx = animatingFireItems.value.indexOf(id)
    if (idx >= 0) animatingFireItems.value.splice(idx, 1)
  }, 900)

  if (next >= item.maxUses && !usedSpecialItems.value.includes(id)) {
    usedSpecialItems.value.push(id)
  }
}

// ── Attack / Defense potions ──────────────────────────────
function useAttackPotion(id: string) {
  if (attackDice.value === null) return
  attackDice.value = Math.min(6 - store.weaponBonus, attackDice.value + 2)
  usePotionCharge(id)
}

function useDefensePotion(id: string) {
  if (defenseDice.value === null) return
  defenseDice.value = Math.min(6 - store.armorBonus, defenseDice.value + 2)
  usePotionCharge(id)
}

// ── Heal potion ───────────────────────────────────────────
const healDialogItemId = ref<string | null>(null)
const healRolled = ref(1)

// +4 fixer Heiltrank – kein Dialog, direkt anwenden
function useFixedHeal(id: string) {
  if (bodyStrength.value === null || !character.value) return
  const startBs = defaultStats[character.value]?.bodyStrength ?? bodyStrength.value
  bodyStrength.value = Math.min(startBs, bodyStrength.value + 4)
  usePotionCharge(id)
}

// Würfel-Heiltrank – Dialog öffnen
function openHealDialog(id: string) {
  healRolled.value = 1
  healDialogItemId.value = id
}

// Würfel-Heiltrank – Ergebnis anwenden (1–6, nie über Startwert)
function applyHeal(id: string) {
  if (bodyStrength.value === null || !character.value) return
  const startBs = defaultStats[character.value]?.bodyStrength ?? bodyStrength.value
  const heal = Math.min(healRolled.value, startBs - bodyStrength.value)
  bodyStrength.value = bodyStrength.value + Math.max(0, heal)
  healDialogItemId.value = null
  usePotionCharge(id)
}

// ── Item bonus labels (für Box + Header) ─────────────────
function getItemBonusLabel(item: SpecialItemOption): string | null {
  switch (item.kind) {
    case 'attack-potion':
      return '+2 ⚔️'
    case 'defense-potion':
      return '+2 🛡'
    case 'heal-fixed':
      return '+4 ❤️'
    case 'heal-potion':
      return '1W6 ❤️'
    case 'fire-shield':
      return `${item.maxUses ?? 2}× 🔥`
    case 'magic-ring':
      return '+1 💍 +1 🪄'
    default:
      return item.bonusLabel ?? null
  }
}

// Aggregierte Badges für "Gegenstände"-Header
const headerAttackPotions = computed(() =>
  equippedSpecialItems.value
    .filter((id) => {
      const it = specialItemOptions.find((i) => i.id === id)
      return it?.kind === 'attack-potion' && !usedSpecialItems.value.includes(id)
    })
    .reduce((sum, id) => sum + getPotionQuantity(id), 0),
)

const headerDefensePotions = computed(() =>
  equippedSpecialItems.value
    .filter((id) => {
      const it = specialItemOptions.find((i) => i.id === id)
      return it?.kind === 'defense-potion' && !usedSpecialItems.value.includes(id)
    })
    .reduce((sum, id) => sum + getPotionQuantity(id), 0),
)

const headerHealPotions = computed(() =>
  equippedSpecialItems.value
    .filter((id) => {
      const it = specialItemOptions.find((i) => i.id === id)
      return (it?.kind === 'heal-fixed' || it?.kind === 'heal-potion') && !usedSpecialItems.value.includes(id)
    })
    .reduce((sum, id) => sum + getPotionQuantity(id), 0),
)
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
        >+{{ store.weaponBonus }} ⚔️</span
      >
    </div>
    <div class="equip-list">
      <div v-if="!character" class="equip-item equip-item--placeholder">
        <span class="equip-item-placeholder">Wähle einen Charakter, um die Ausrüstung anzuzeigen</span>
      </div>
      <template v-else>
        <!-- Zeige nur aktive Waffen -->
        <div v-if="equippedWeapon.length === 0" class="equip-item equip-item--placeholder">
          <span class="equip-item-placeholder">Keine aktiven Waffen</span>
        </div>
        <template v-else>
          <button
            v-for="w in equippedWeaponOptions"
            :key="w.id"
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
            <span class="equip-item-check">✓</span>
          </button>
        </template>

        <!-- Dropdown to add a new weapon -->
        <div class="equip-add-row" v-if="availableWeapons.length > 0">
          <select v-model="selectedWeaponToAdd">
            <option value="">Waffe hinzufügen…</option>
            <option v-for="w in availableWeapons" :key="w.id" :value="w.id">{{ w.label }}</option>
          </select>
          <button class="btn-add" type="button" @click="addWeaponFromSelect">Hinzufügen</button>
        </div>
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
        <!-- Zeige nur aktive Rüstungsteile -->
        <div v-if="equippedArmor.length === 0" class="equip-item equip-item--placeholder">
          <span class="equip-item-placeholder">Keine aktive Rüstung</span>
        </div>
        <template v-else>
          <button
            v-for="a in equippedArmorOptions"
            :key="a.id"
            :class="{ 'equip-item--selected equip-item--armor': true }"
            class="equip-item"
            type="button"
            @click="toggleArmor(a.id)"
          >
            <span class="equip-item-icon">🛡</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ a.label }}</span>
            </span>
            <span class="equip-item-bonus equip-item-bonus--armor">+{{ a.bonus }}</span>
            <span class="equip-item-check equip-item-check--armor">✓</span>
          </button>
        </template>

        <!-- Dropdown to add a new armor piece -->
        <div class="equip-add-row" v-if="availableArmor.length > 0">
          <select v-model="selectedArmorToAdd">
            <option value="">Rüstung hinzufügen…</option>
            <option v-for="a in availableArmor" :key="a.id" :value="a.id">{{ a.label }}</option>
          </select>
          <button class="btn-add" type="button" @click="addArmorFromSelect">Hinzufügen</button>
        </div>
      </template>
    </div>
  </div>

  <!-- Gegenstände -->
  <div class="equip-block">
    <div class="equip-block-header">
      <span class="equip-block-label">Gegenstände</span>
      <div class="equip-badges-row">
        <span v-if="headerAttackPotions > 0" class="equip-badge equip-badge--attack-active"
          >+{{ headerAttackPotions }} ⚔️</span
        >
        <span v-if="headerDefensePotions > 0" class="equip-badge equip-badge--yellow-active"
          >+{{ headerDefensePotions }} 🛡</span
        >
        <span v-if="headerHealPotions > 0" class="equip-badge equip-badge--heal-active"
          >{{ headerHealPotions }}× ❤️</span
        >
        <span v-if="store.intelligenceBonus > 0" class="equip-badge equip-badge--intel-active"
          >+{{ store.intelligenceBonus }} 🧠</span
        >
      </div>
    </div>
    <div class="equip-list">
      <div v-if="!character" class="equip-item equip-item--placeholder">
        <span class="equip-item-placeholder">Wähle einen Charakter, um die Ausrüstung anzuzeigen</span>
      </div>
      <template v-else>
        <div v-if="equippedSpecialItems.length === 0" class="equip-item equip-item--placeholder">
          <span class="equip-item-placeholder">Keine aktiven Gegenstände</span>
        </div>
        <template v-else v-for="(item, idx) in equippedSpecialOptions" :key="item.id">
        <!-- Kategorie-Label bei Kategoriewechsel -->
        <div v-if="idx === 0 || (idx > 0 && getItemCategory(equippedSpecialOptions[idx - 1]!) !== getItemCategory(item))" class="equip-group-label">
          <span v-if="getItemCategory(item) === 0">🧪 Tränke</span>
          <span v-else-if="getItemCategory(item) === 1">✨ Magische Gegenstände</span>
          <span v-else>📦 Sonstiges</span>
        </div>
        <!-- ① PASSIVE (e.g. Amulett der Weisheit) -->
        <div
          v-if="item.passive"
          :class="{
            'equip-item--selected equip-item--passive': equippedSpecialItems.includes(item.id),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button class="equip-item-toggle" type="button" @click.stop="toggleSpecialItem(item.id)">
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span v-if="item.intelligenceBonus" class="equip-item-bonus equip-item-bonus--passive">
              +{{ item.intelligenceBonus }} 🧠
            </span>
            <span v-if="equippedSpecialItems.includes(item.id)" class="equip-item-check equip-item-check--passive"
              >✓</span
            >
          </button>
        </div>

        <!-- ② FIRE SHIELD (Ring des Feuers – 2 Ladungen, roter Effekt) -->
        <div
          v-else-if="item.kind === 'fire-shield'"
          :class="{
            'equip-item--fire-selected': equippedSpecialItems.includes(item.id) && !isFullyUsed(item),
            'equip-item--used': isFullyUsed(item),
            'equip-item--fire-flash': animatingFireItems.includes(item.id),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span class="equip-item-bonus equip-item-bonus--fire">{{ getItemBonusLabel(item) }}</span>
            <!-- Verbrauchsanzeige: rote Kreise -->
            <span v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="fire-charges">
              <span v-for="i in item.maxUses ?? 0" :key="i">{{ i <= getChargesLeft(item) ? '🔴' : '⚫' }}</span>
            </span>
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ VERBRAUCHT</span>
            <span v-else-if="equippedSpecialItems.includes(item.id)" class="equip-item-check">✓</span>
          </button>
          <button
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            class="btn-use-item btn-use-item--fire"
            type="button"
            @click="useFireCharge(item.id)"
          >
            🔥 Feuerzauber abwehren
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>

        <!-- ③a HEAL FIXED (Heiltrank +4 – kein Würfelwurf) -->
        <div
          v-else-if="item.kind === 'heal-fixed'"
          :class="{
            'equip-item--heal-selected': equippedSpecialItems.includes(item.id) && !isFullyUsed(item),
            'equip-item--used': isFullyUsed(item),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span class="equip-item-bonus equip-item-bonus--heal">{{ getItemBonusLabel(item) }}</span>
            <span
              v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
              class="equip-item-check equip-item-check--heal"
              >✓</span
            >
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ GETRUNKEN</span>
          </button>
          <!-- Anzahl -->
          <div v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="qty-row">
            <span class="qty-label">Anzahl</span>
            <div class="qty-controls">
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, -1)">−</button>
              <span class="qty-num">{{ getPotionQuantity(item.id) }}</span>
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, 1)">+</button>
            </div>
          </div>
          <button
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            class="btn-use-item btn-use-item--heal"
            type="button"
            @click="useFixedHeal(item.id)"
          >
            ✚ +4 Körperkraft heilen
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>

        <!-- ③b HEAL POTION (Heiltrank Würfel – 1W6) -->
        <div
          v-else-if="item.kind === 'heal-potion'"
          :class="{
            'equip-item--heal-selected': equippedSpecialItems.includes(item.id) && !isFullyUsed(item),
            'equip-item--used': isFullyUsed(item),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span class="equip-item-bonus equip-item-bonus--heal">{{ getItemBonusLabel(item) }}</span>
            <span
              v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
              class="equip-item-check equip-item-check--heal"
              >✓</span
            >
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ GETRUNKEN</span>
          </button>
          <!-- Anzahl -->
          <div
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item) && healDialogItemId !== item.id"
            class="qty-row"
          >
            <span class="qty-label">Anzahl</span>
            <div class="qty-controls">
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, -1)">−</button>
              <span class="qty-num">{{ getPotionQuantity(item.id) }}</span>
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, 1)">+</button>
            </div>
          </div>
          <!-- Inline dice dialog -->
          <div
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item) && healDialogItemId === item.id"
            class="heal-dialog"
          >
            <p class="heal-dialog-label">Gewürfeltes Ergebnis (1W6):</p>
            <div class="heal-controls">
              <button :disabled="healRolled <= 1" class="heal-adj" @click="healRolled > 1 && healRolled--">−</button>
              <span class="heal-value">{{ healRolled }}</span>
              <button :disabled="healRolled >= 6" class="heal-adj" @click="healRolled < 6 && healRolled++">+</button>
            </div>
            <p class="heal-dialog-result">
              → Heilt
              <strong>{{
                Math.min(healRolled, Math.max(0, (defaultStats[character]?.bodyStrength ?? 0) - (bodyStrength ?? 0)))
              }}</strong>
              Punkt(e)
            </p>
            <div class="heal-actions">
              <button class="btn-heal-confirm" @click="applyHeal(item.id)">✚ Heilen</button>
              <button class="btn-heal-cancel" @click="healDialogItemId = null">✕ Abbrechen</button>
            </div>
          </div>
          <button
            v-else-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            class="btn-use-item btn-use-item--heal"
            type="button"
            @click="openHealDialog(item.id)"
          >
            🎲 Würfeln &amp; Heilen
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>

        <!-- ④ ATTACK / DEFENSE POTION -->
        <div
          v-else-if="item.kind === 'attack-potion' || item.kind === 'defense-potion'"
          :class="{
            'equip-item--selected':
              equippedSpecialItems.includes(item.id) && !isFullyUsed(item) && item.kind === 'attack-potion',
            'equip-item--defense-potion-selected':
              equippedSpecialItems.includes(item.id) && !isFullyUsed(item) && item.kind === 'defense-potion',
            'equip-item--used': isFullyUsed(item),
            'equip-item--magic-flash': animatingItems.includes(item.id),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span class="equip-item-bonus">{{ getItemBonusLabel(item) }}</span>
            <span v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="equip-item-check">✓</span>
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ GETRUNKEN</span>
          </button>
          <!-- Anzahl -->
          <div v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="qty-row">
            <span class="qty-label">Anzahl</span>
            <div class="qty-controls">
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, -1)">−</button>
              <span class="qty-num">{{ getPotionQuantity(item.id) }}</span>
              <button class="qty-btn" type="button" @click="adjustPotionQuantity(item.id, 1)">+</button>
            </div>
          </div>
          <button
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            class="btn-use-item"
            type="button"
            @click="item.kind === 'attack-potion' ? useAttackPotion(item.id) : useDefensePotion(item.id)"
          >
            ✦ Trinken
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>

        <!-- ⑤a MAGIC RING (Ring der Magie: ⚫→🔵 speichern, dann abfeuern) -->
        <div
          v-else-if="item.kind === 'magic-ring'"
          :class="{
            'equip-item--selected': equippedSpecialItems.includes(item.id) && !isFullyUsed(item),
            'equip-item--used': isFullyUsed(item),
            'equip-item--magic-flash': animatingItems.includes(item.id),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <!-- Statisches Fähigkeits-Label -->
            <span class="equip-item-bonus equip-item-bonus--magic">{{ getItemBonusLabel(item) }}</span>
            <!-- Ladungsanzeige: ⚫ = leer, 🔵 = Zauber gespeichert -->
            <span v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="magic-charges">
              {{ getChargesUsed(item) >= 1 ? '🔵' : '⚫' }}
            </span>
            <span v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="equip-item-check">✓</span>
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ VERBRAUCHT</span>
          </button>
          <button
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            :class="{ 'btn-use-item--fire-spell': getChargesUsed(item) >= 1 }"
            class="btn-use-item"
            type="button"
            @click="useMagicCharge(item.id)"
          >
            <template v-if="getChargesUsed(item) === 0">💍 Zauber im Ring speichern</template>
            <template v-else>✦ Gespeicherten Zauber abfeuern</template>
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>

        <!-- ⑤b DEFAULT ACTIVE (Stab der Magie …) -->
        <div
          v-else
          :class="{
            'equip-item--selected': equippedSpecialItems.includes(item.id) && !isFullyUsed(item),
            'equip-item--used': isFullyUsed(item),
            'equip-item--magic-flash': animatingItems.includes(item.id),
          }"
          class="equip-item equip-item--special-wrap"
        >
          <button
            :disabled="isFullyUsed(item)"
            class="equip-item-toggle"
            type="button"
            @click.stop="toggleSpecialItem(item.id)"
          >
            <span class="equip-item-icon">{{ item.symbol }}</span>
            <span class="equip-item-content">
              <span class="equip-item-name">{{ item.label }}</span>
              <span class="equip-item-note">{{ item.ability }}</span>
            </span>
            <span v-if="getItemBonusLabel(item)" class="equip-item-bonus equip-item-bonus--magic">
              {{ getItemBonusLabel(item) }}
            </span>
            <!-- Blue charge dots for multi-use items (kein Stab der Magie) -->
            <span
              v-if="item.maxUses && equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
              class="magic-charges"
            >
              <span v-for="i in item.maxUses ?? 0" :key="i">{{ i <= getChargesLeft(item) ? '🔵' : '⚫' }}</span>
            </span>
            <span v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)" class="equip-item-check">✓</span>
            <span v-if="isFullyUsed(item)" class="equip-item-used-badge">✕ BENUTZT</span>
          </button>
          <button
            v-if="equippedSpecialItems.includes(item.id) && !isFullyUsed(item)"
            class="btn-use-item"
            type="button"
            @click="item.maxUses ? useMagicCharge(item.id) : markItemUsed(item.id)"
          >
            ✦ Benutzen
          </button>
          <button v-if="isFullyUsed(item)" class="btn-restore-item" type="button" @click="resetItemUsed(item.id)">
            ↺ Wiederherstellen
          </button>
        </div>
        </template>

        <!-- Dropdown to add a new special item -->
        <div class="equip-add-row">
          <select v-model="selectedSpecialToAdd">
            <option value="">Gegenstand hinzufügen…</option>
            <option v-for="i in availableSpecialItems" :key="i.id" :value="i.id">{{ i.label }}</option>
          </select>
          <button class="btn-add" type="button" @click="addSpecialFromSelect">Hinzufügen</button>
        </div>
      </template>
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
  color: var(--hq-color-defense);
  border-color: var(--hq-color-defense);
  background-color: color-mix(in srgb, var(--hq-color-defense) 12%, transparent);
}

.equip-badge--yellow-active {
  color: var(--hq-color-yellow);
  border-color: var(--hq-color-yellow);
  background-color: color-mix(in srgb, var(--hq-color-yellow) 12%, transparent);
}

.equip-badge--intel-active {
  color: var(--color-blue);
  border-color: var(--color-blue);
  background-color: color-mix(in srgb, var(--color-blue) 12%, transparent);
}

.equip-badge--heal-active {
  color: color-mix(in srgb, var(--color-red) 65%, white);
  border-color: var(--color-red);
  background-color: color-mix(in srgb, var(--color-red) 12%, transparent);
}

.equip-badges-row {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.equip-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.equip-group-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hq-hint);
  padding: 0.5rem 0.65rem;
  margin-top: 0.25rem;
  border-bottom: 1px solid var(--hq-divider);
  transition: color 0.4s, border-color 0.4s;
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
  border-color: var(--hq-color-defense);
  background-color: color-mix(in srgb, var(--hq-color-defense) 8%, var(--hq-card-bg-dark));
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
  color: var(--hq-color-defense);
}

/* Defense-potion selected (yellow) */
.equip-item--defense-potion-selected {
  border-color: var(--hq-color-yellow);
  background-color: color-mix(in srgb, var(--hq-color-yellow) 8%, var(--hq-card-bg-dark));
}

.equip-item--defense-potion-selected .equip-item-bonus,
.equip-item--defense-potion-selected .equip-item-check {
  color: var(--hq-color-yellow);
}

/* Heal-selected bonus color */
.equip-item--heal-selected .equip-item-bonus,
.equip-item-bonus--heal {
  color: var(--color-red);
}

/* Fire-selected bonus color */
.equip-item--fire-selected .equip-item-bonus,
.equip-item-bonus--fire {
  color: var(--color-red);
}

/* Magic (Stab/Ring der Magie) bonus color */
.equip-item--selected .equip-item-bonus--magic,
.equip-item-bonus--magic {
  color: var(--color-blue);
}

.equip-item-check {
  font-size: 0.85rem;
  color: var(--color-green);
  flex-shrink: 0;
  align-self: center;
  font-weight: bold;
}

.equip-item-check--armor {
  color: var(--hq-color-defense);
}

.equip-item-check--passive {
  color: var(--color-blue);
}

.equip-item--passive.equip-item--selected {
  border-color: var(--color-blue);
  background-color: color-mix(in srgb, var(--color-blue) 8%, var(--hq-card-bg-dark));
}

.equip-item-bonus--passive {
  color: var(--color-blue);
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

/* ── Fire-shield styles ─────────────────────────────────── */
.equip-item--fire-selected {
  border-color: var(--color-red);
  background-color: color-mix(in srgb, var(--color-red) 8%, var(--hq-card-bg-dark));
}

.fire-charges {
  display: flex;
  gap: 0.1rem;
  font-size: 0.75rem;
  flex-shrink: 0;
  align-self: center;
}

.magic-charges {
  display: flex;
  gap: 0.1rem;
  font-size: 0.75rem;
  flex-shrink: 0;
  align-self: center;
}

/* "Abfeuern"-Button: wärmerer Ton wenn Zauber gespeichert ist */
.btn-use-item--fire-spell {
  background-color: color-mix(in srgb, var(--color-yellow) 18%, var(--hq-card-bg-dark));
  color: var(--color-yellow);
  border-top: 1px solid color-mix(in srgb, var(--color-yellow) 30%, transparent);
}

.btn-use-item--fire-spell:hover {
  background-color: color-mix(in srgb, var(--color-yellow) 28%, var(--hq-card-bg-dark));
}

.btn-use-item--fire {
  background-color: color-mix(in srgb, var(--color-red) 18%, var(--hq-card-bg-dark));
  color: var(--color-red);
  border-top: 1px solid color-mix(in srgb, var(--color-red) 30%, transparent);
}

.btn-use-item--fire:hover {
  background-color: color-mix(in srgb, var(--color-red) 28%, var(--hq-card-bg-dark));
}

@keyframes fire-flash {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
    border-color: var(--color-red);
  }
  15% {
    opacity: 1;
    transform: scale(1.04);
    box-shadow:
      0 0 12px 4px color-mix(in srgb, var(--color-red) 60%, transparent),
      0 0 32px 8px color-mix(in srgb, var(--color-red) 30%, transparent);
    border-color: var(--color-red);
  }
  40% {
    opacity: 1;
    transform: scale(1.02);
    box-shadow:
      0 0 20px 6px color-mix(in srgb, var(--color-red) 50%, transparent),
      0 0 48px 12px color-mix(in srgb, var(--color-red) 20%, transparent);
  }
  70% {
    opacity: 0.7;
    transform: scale(1.01);
    box-shadow: 0 0 8px 2px color-mix(in srgb, var(--color-red) 25%, transparent);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
    box-shadow: none;
  }
}

.equip-item--fire-flash {
  animation: fire-flash 0.9s ease-out forwards;
  border-color: var(--color-red) !important;
  background-color: color-mix(in srgb, var(--color-red) 12%, var(--hq-card-bg-dark)) !important;
  z-index: 1;
  position: relative;
}

/* ── Heal-potion styles ─────────────────────────────────── */
.equip-item--heal-selected {
  border-color: var(--color-red);
  background-color: color-mix(in srgb, var(--color-red) 8%, var(--hq-card-bg-dark));
}

.equip-item-check--heal {
  font-size: 0.85rem;
  color: var(--color-red);
  flex-shrink: 0;
  align-self: center;
  font-weight: bold;
}

.btn-use-item--heal {
  background-color: color-mix(in srgb, var(--color-red) 18%, var(--hq-card-bg-dark));
  color: color-mix(in srgb, var(--color-red) 65%, white);
  border-top: 1px solid color-mix(in srgb, var(--color-red) 30%, transparent);
}

.btn-use-item--heal:hover {
  background-color: color-mix(in srgb, var(--color-red) 28%, var(--hq-card-bg-dark));
}

.heal-dialog {
  border-top: 1px solid color-mix(in srgb, var(--color-red) 25%, transparent);
  background-color: color-mix(in srgb, var(--color-red) 6%, var(--hq-card-bg-dark));
  padding: 0.75rem 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.heal-dialog-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-red) 65%, white);
  text-align: center;
}

.heal-dialog-result {
  font-family: var(--font-body), serif;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--color-red) 65%, white);
  text-align: center;
}

.heal-dialog-result strong {
  font-size: 1rem;
  font-family: var(--font-fantasy), serif;
}

.heal-controls {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.heal-adj {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-red);
  background: transparent;
  color: color-mix(in srgb, var(--color-red) 65%, white);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.heal-adj:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-red) 20%, transparent);
}

.heal-adj:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.heal-value {
  font-family: var(--font-fantasy), serif;
  font-size: 1.75rem;
  color: color-mix(in srgb, var(--color-red) 65%, white);
  min-width: 1.5rem;
  text-align: center;
}

.heal-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.btn-heal-confirm {
  flex: 1;
  font-family: var(--font-fantasy), serif;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: color-mix(in srgb, var(--color-red) 22%, var(--hq-card-bg-dark));
  color: color-mix(in srgb, var(--color-red) 65%, white);
  border: 1px solid color-mix(in srgb, var(--color-red) 40%, transparent);
  border-radius: 2px;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-heal-confirm:hover {
  background-color: color-mix(in srgb, var(--color-red) 35%, var(--hq-card-bg-dark));
}

.btn-heal-cancel {
  font-family: var(--font-fantasy), serif;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  background-color: transparent;
  color: var(--hq-hint);
  border: 1px solid var(--hq-divider);
  border-radius: 2px;
  padding: 0.4rem 0.65rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-heal-cancel:hover {
  background-color: color-mix(in srgb, var(--hq-hint) 15%, transparent);
  color: var(--hq-input-text);
}

/* ── Potion quantity controls ───────────────────────────── */
.qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.65rem;
  border-top: 1px solid color-mix(in srgb, var(--hq-hint) 15%, transparent);
  background-color: color-mix(in srgb, var(--hq-hint) 5%, var(--hq-card-bg-dark));
}

.qty-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hq-hint);
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.qty-btn {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1.5px solid var(--hq-input-border);
  background: transparent;
  color: var(--hq-input-text);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.qty-btn:hover {
  background-color: color-mix(in srgb, var(--hq-hint) 20%, transparent);
  border-color: var(--hq-hint);
}

.qty-btn:active {
  transform: scale(0.92);
}

.qty-num {
  font-family: var(--font-fantasy), serif;
  font-size: 1rem;
  color: var(--hq-input-text);
  min-width: 1.2rem;
  text-align: center;
}

/* Dropdown add-row */
.equip-add-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding-top: 0.35rem;
}
.equip-add-row select {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border-radius: 2px;
  border: 1px solid var(--hq-input-border);
  background: var(--hq-card-bg-dark);
  color: var(--hq-input-text);
}
.btn-add {
  padding: 0.35rem 0.6rem;
  border-radius: 2px;
  border: none;
  background: color-mix(in srgb, var(--color-blue) 18%, var(--hq-card-bg-dark));
  color: var(--color-blue);
  cursor: pointer;
}
</style>
