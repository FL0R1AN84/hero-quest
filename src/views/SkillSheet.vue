<script lang="ts" setup>
import { watch, computed } from 'vue'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { storeToRefs } from 'pinia'

const store = useSkillSheetStore()
const {
  name,
  character,
  attackDice,
  defenseDice,
  bodyStrength,
  intelligence,
  equippedWeapon,
  equippedArmor,
  equippedSpecialItems,
  usedSpecialItems,
} = storeToRefs(store)

const characterOptions = ['Barbar', 'Barde', 'Druide', 'Elf', 'Ritter', 'Zwerg', 'Zauberer']

const characterAvatars: Record<string, { symbol: string; color: string }> = {
  Barbar: { symbol: '⚔️', color: 'var(--color-red)' },
  Barde: { symbol: '📯', color: 'var(--color-blue)' },
  Druide: { symbol: '🧙', color: 'var(--color-green)' },
  Elf: { symbol: '🧝‍♂️', color: 'var(--color-green)' },
  Ritter: { symbol: '🏰', color: 'var(--color-yellow)' },
  Zwerg: { symbol: '⚒️', color: 'var(--color-yellow)' },
  Zauberer: { symbol: '🪄', color: 'var(--color-blue)' },
}

const defaultStats: Record<
  string,
  { attackDice: number; defenseDice: number; bodyStrength: number; intelligence: number }
> = {
  Barbar: { attackDice: 3, defenseDice: 2, bodyStrength: 8, intelligence: 2 },
  Barde: { attackDice: 2, defenseDice: 2, bodyStrength: 5, intelligence: 4 },
  Druide: { attackDice: 1, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Elf: { attackDice: 2, defenseDice: 2, bodyStrength: 6, intelligence: 4 },
  Ritter: { attackDice: 2, defenseDice: 3, bodyStrength: 7, intelligence: 2 },
  Zwerg: { attackDice: 2, defenseDice: 2, bodyStrength: 7, intelligence: 3 },
  Zauberer: { attackDice: 1, defenseDice: 2, bodyStrength: 4, intelligence: 6 },
}

watch(character, (newChar) => {
  const stats = defaultStats[newChar]
  if (stats) {
    attackDice.value = stats.attackDice
    defenseDice.value = stats.defenseDice
    bodyStrength.value = stats.bodyStrength
    intelligence.value = stats.intelligence
  }
  // Remove weapons the new character can't use
  equippedWeapon.value = equippedWeapon.value.filter((id) => {
    const w = weaponOptions.find((w) => w.id === id)
    return !w?.allowedCharacters || w.allowedCharacters.includes(newChar)
  })
  // Remove special items the new character can't use
  equippedSpecialItems.value = equippedSpecialItems.value.filter((id) => {
    const item = specialItemOptions.find((i) => i.id === id)
    return !item?.allowedCharacters || item.allowedCharacters.includes(newChar)
  })
})

// ── Equipment data ────────────────────────────────────────
interface WeaponOption {
  id: string
  label: string
  note: string | null
  bonus: number
  allowedCharacters: string[] | null
}

interface SpecialItemOption {
  id: string
  label: string
  symbol: string
  ability: string
  allowedCharacters: string[] | null
}

const weaponOptions: WeaponOption[] = [
  { id: 'breitschwert', label: 'Breitschwert', note: null, bonus: 2, allowedCharacters: ['Barbar'] },
  { id: 'langschwert', label: 'Langschwert', note: 'Kann auch diagonal angreifen', bonus: 1, allowedCharacters: null },
  { id: 'streitaxt', label: 'Streitaxt', note: null, bonus: 1, allowedCharacters: null },
  { id: 'kurzschwert', label: 'Kurzschwert', note: null, bonus: 1, allowedCharacters: null },
  {
    id: 'ork-kurzschwert',
    label: 'Ork-Kurzschwert',
    note: 'Orks können zweimal hintereinander angegriffen werden',
    bonus: 1,
    allowedCharacters: null,
  },
]

const armorOptions: { id: string; label: string; bonus: number }[] = [
  { id: 'helm', label: 'Helm', bonus: 1 },
  { id: 'plattenruestung', label: 'Plattenrüstung', bonus: 2 },
  { id: 'kettenhemd', label: 'Kettenhemd', bonus: 1 },
  { id: 'schild', label: 'Schild', bonus: 1 },
  { id: 'armpanzer', label: 'Armpanzer', bonus: 1 },
]

const specialItemOptions: SpecialItemOption[] = [
  {
    id: 'stab-der-magie',
    label: 'Stab der Magie',
    symbol: '🪄',
    ability: '2× hintereinander zaubern',
    allowedCharacters: ['Druide', 'Zauberer'],
  },
  {
    id: 'ring-der-magie',
    label: 'Ring der Magie',
    symbol: '💍',
    ability: 'Klont einen Zauber und speichert ihn im Ring – einlösbar in einer anderen Runde',
    allowedCharacters: ['Druide', 'Zauberer'],
  },
]

// ── Equipment bonuses ─────────────────────────────────────
const weaponBonus = computed(() =>
  equippedWeapon.value.reduce((sum, id) => {
    const w = weaponOptions.find((w) => w.id === id)
    return sum + (w?.bonus ?? 1)
  }, 0),
)
const armorBonus = computed(() =>
  equippedArmor.value.reduce((sum, id) => {
    const a = armorOptions.find((a) => a.id === id)
    return sum + (a?.bonus ?? 1)
  }, 0),
)

// ── Effective stats (base + bonus) shown in the diamonds ──
const effectiveAttackDice = computed({
  get: () => (attackDice.value ?? 0) + weaponBonus.value,
  set: (v: number) => {
    attackDice.value = v - weaponBonus.value
  },
})

const effectiveDefenseDice = computed({
  get: () => (defenseDice.value ?? 0) + armorBonus.value,
  set: (v: number) => {
    defenseDice.value = v - armorBonus.value
  },
})

// ── Restriction helpers ───────────────────────────────────
function canEquipWeapon(w: WeaponOption): boolean {
  if (character.value === 'Zauberer') return false
  return !w.allowedCharacters || w.allowedCharacters.includes(character.value)
}

function canEquipSpecialItem(item: SpecialItemOption): boolean {
  return !item.allowedCharacters || item.allowedCharacters.includes(character.value)
}

// ── Filtered lists (only show items the current character can carry) ──
const visibleWeapons = computed(() => weaponOptions.filter(canEquipWeapon))
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

function markItemUsed(id: string) {
  if (!usedSpecialItems.value.includes(id)) usedSpecialItems.value.push(id)
}

function resetItemUsed(id: string) {
  const idx = usedSpecialItems.value.indexOf(id)
  if (idx >= 0) usedSpecialItems.value.splice(idx, 1)
}
</script>

<template>
  <main class="main-bg">
    <!-- Parchment card -->
    <div class="card-wrap">
      <!-- Card body -->
      <div class="card">
        <!-- Title -->
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

        <!-- Form fields -->
        <form class="space-y-5" @submit.prevent>
          <!-- Name -->
          <div class="flex flex-col gap-1">
            <label class="field-label" for="name">Name des Helden</label>
            <input id="name" v-model="name" class="field-input" placeholder="Dein Heldenname …" type="text" />
          </div>

          <!-- Charakter -->
          <div class="flex flex-col gap-1">
            <label class="field-label" for="character">Charakter</label>
            <div class="relative">
              <select id="character" v-model="character" class="field-input field-select">
                <option disabled value="">Wähle deinen Charakter …</option>
                <option v-for="opt in characterOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <span class="select-arrow">▾</span>
            </div>
          </div>

          <!-- Divider -->
          <div class="section-divider">
            <div class="divider-line"></div>
          </div>

          <!-- Avatar -->
          <div class="avatar-wrap">
            <div
              :class="{ 'avatar-frame--empty': !character }"
              :style="character ? { borderColor: characterAvatars[character]?.color } : {}"
              class="avatar-frame"
            >
              <span
                :class="{ 'avatar-symbol--empty': !character }"
                :style="character ? { color: characterAvatars[character]?.color } : {}"
                class="avatar-symbol"
                >{{ character ? characterAvatars[character]?.symbol : '–' }}</span
              >
            </div>
            <p v-if="character" class="avatar-name">{{ character }}</p>
          </div>

          <div class="section-divider">
            <div class="divider-line"></div>
          </div>

          <!-- Stats row -->
          <div class="stats-grid">
            <!-- Angriffswürfel: green -->
            <div class="stat-cell">
              <div class="stat-diamond-wrap">
                <div class="diamond" style="border-color: var(--color-green)">
                  <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
                  <input
                    v-else
                    v-model.number="effectiveAttackDice"
                    class="diamond-input"
                    max="99"
                    min="0"
                    placeholder="–"
                    type="number"
                  />
                </div>
              </div>
              <label class="stat-label">Angriffs-<br />würfel</label>
            </div>

            <!-- Verteidigungswürfel: yellow -->
            <div class="stat-cell">
              <div class="stat-diamond-wrap">
                <div class="diamond" style="border-color: var(--color-yellow)">
                  <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
                  <input
                    v-else
                    v-model.number="effectiveDefenseDice"
                    class="diamond-input"
                    max="99"
                    min="0"
                    placeholder="–"
                    type="number"
                  />
                </div>
              </div>
              <label class="stat-label">Verteidi-<br />gungs-<br />würfel</label>
            </div>

            <!-- Körperkraft: red -->
            <div class="stat-cell">
              <div class="diamond" style="border-color: var(--color-red)">
                <input
                  v-model.number="bodyStrength"
                  class="diamond-input"
                  max="99"
                  min="0"
                  placeholder="–"
                  type="number"
                />
              </div>
              <label class="stat-label">Körper-<br />kraft</label>
            </div>

            <!-- Intelligenz: blue -->
            <div class="stat-cell">
              <div class="diamond" style="border-color: var(--color-blue)">
                <input
                  v-model.number="intelligence"
                  class="diamond-input"
                  max="99"
                  min="0"
                  placeholder="–"
                  type="number"
                />
              </div>
              <label class="stat-label">Intelli-<br />genz</label>
            </div>
          </div>

          <!-- ── Ausrüstung ─────────────────────────────── -->
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
              <span
                :class="weaponBonus > 0 ? 'equip-badge--attack-active' : 'equip-badge--inactive'"
                class="equip-badge"
                >+{{ weaponBonus }} ⚔</span
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
              <span
                :class="armorBonus > 0 ? 'equip-badge--defense-active' : 'equip-badge--inactive'"
                class="equip-badge"
                >+{{ armorBonus }} 🛡</span
              >
            </div>
            <div class="equip-list">
              <div v-if="!character" class="equip-item equip-item--placeholder">
                <span class="equip-item-placeholder">Wähle einen Charakter, um die Ausrüstung anzuzeigen</span>
              </div>
              <template v-else>
                <button
                  v-for="a in armorOptions"
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

          <!-- Gegenstände (special one-time items) -->
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

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button
              class="btn-save"
              type="button"
              @click="store.$patch({ name, character, attackDice, defenseDice, bodyStrength, intelligence })"
            >
              ✦ Speichern
            </button>
          </div>

          <!-- Saved indicator -->
          <p class="hint">Deine Werte werden automatisch im Browser gespeichert.</p>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.main-bg {
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: calc(1.25rem + env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right))
    calc(2rem + env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
  background-color: var(--hq-bg);
  transition: background-color 0.4s;
}

.card-wrap {
  position: relative;
  width: 100%;
  max-width: 32rem;
}

/* ── Card ───────────────────────────────────────────────── */
.card {
  background-color: var(--hq-card-bg);
  border: 4px solid var(--hq-card-border);
  border-radius: 2px;
  overflow: hidden;
  padding: 1.5rem 1rem 2rem;
  box-shadow: 0 0 60px var(--hq-card-shadow);
  transition:
    background-color 0.4s,
    border-color 0.4s;
}

/* ── Typography ─────────────────────────────────────────── */
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

.field-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hq-label);
  transition: color 0.4s;
}

.hint {
  text-align: center;
  font-family: var(--font-body), serif;
  font-style: italic;
  font-size: 0.7rem;
  padding-top: 0.25rem;
  color: var(--hq-hint);
  transition: color 0.4s;
}

/* ── Inputs ─────────────────────────────────────────────── */
.field-input {
  background-color: var(--hq-card-bg-dark);
  border: none;
  border-bottom: 2px solid var(--hq-input-border);
  outline: none;
  padding: 0.5rem 0.5rem;
  font-family: var(--font-body), serif;
  font-size: 1rem; /* ≥ 16 px — prevents iOS Safari from auto-zooming on focus */
  transition:
    border-color 0.2s,
    background-color 0.4s,
    color 0.4s;
  width: 100%;
  /* larger tap target */
  min-height: 2.5rem;
}

.field-input::placeholder {
  color: var(--hq-input-placeholder);
}

.field-input:focus {
  border-bottom-color: var(--hq-input-border-focus);
}

.field-select {
  appearance: none;
  cursor: pointer;
}

.select-arrow {
  pointer-events: none;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--hq-ornament);
}

/* ── Dividers & ornaments ───────────────────────────────── */
.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--hq-divider);
  transition: background-color 0.4s;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.sword-ornament {
  font-size: 1.25rem;
  color: var(--hq-ornament);
  transition: color 0.4s;
}

/* 2×2 on mobile, 4×1 on wider screens */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1rem;
  padding-block-start: 2rem;
  padding-block-end: 1rem;
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
  transition: background-color 0.4s;
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
  /* ensure tappable area */
  padding: 0.25rem 0;
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

/* ── Avatar ─────────────────────────────────────────────── */
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0;
}

.avatar-frame {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  border: 3px solid;
  background-color: var(--hq-card-bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 4px var(--hq-card-bg),
    0 0 0 5px var(--hq-divider),
    0 4px 12px var(--hq-card-shadow);
  transition:
    border-color 0.3s,
    background-color 0.4s;
}

.avatar-frame--empty {
  border-color: var(--hq-input-border);
  border-style: dashed;
}

.avatar-symbol {
  font-size: 2.25rem;
  line-height: 1;
  transition: color 0.3s;
}

.avatar-symbol--empty {
  font-size: 1.5rem;
  color: var(--hq-input-placeholder);
}

.avatar-name {
  font-family: var(--font-fantasy), serif;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hq-label);
  transition: color 0.4s;
}

/* ── Buttons ────────────────────────────────────────────── */
.btn-save {
  flex: 1;
  font-family: var(--font-fantasy), serif;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background-color: var(--hq-btn-save-bg);
  color: var(--hq-btn-save-text);
  border: 2px solid var(--hq-card-border);
  padding: 0.75rem 1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  /* comfortable tap target */
  min-height: 3rem;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.4s;
}

.btn-save:hover {
  background-color: var(--hq-btn-save-hover-bg);
  color: var(--hq-btn-save-hover-text);
}

.btn-save:active {
  transform: scale(0.97);
}

/* ── Wider screens: restore desktop spacing ─────────────── */
@media (min-width: 480px) {
  .main-bg {
    align-items: center;
    padding: 1.5rem;
  }

  .card {
    padding: 2rem 2rem 2.5rem;
  }

  .title {
    font-size: 1.875rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .field-label {
    font-size: 0.75rem;
  }
}

/* ── Hide number spinners ───────────────────────────────── */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

/* ── Stat diamond with bonus badge ──────────────────────── */
.stat-diamond-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-bonus {
  position: absolute;
  bottom: -0.6rem;
  right: -0.6rem;
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  font-weight: bold;
  letter-spacing: 0.04em;
  background-color: var(--hq-card-bg);
  border: 1px solid currentColor;
  border-radius: 99px;
  padding: 0.05rem 0.3rem;
  line-height: 1.4;
  pointer-events: none;
  transition:
    color 0.3s,
    background-color 0.4s;
}

/* ── Equipment section ──────────────────────────────────── */
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

/* Base equip item (used as button or container) */
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

/* When used as a plain button (weapons, armor) */
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

.equip-item-restriction {
  font-family: var(--font-fantasy), serif;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  color: var(--color-yellow);
  opacity: 0.8;
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

/* Special item wrap: contains toggle button + use button */
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
</style>
