<script lang="ts" setup>
import { watch } from 'vue'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { storeToRefs } from 'pinia'

const store = useSkillSheetStore()
const { name, character, attackDice, defenseDice, bodyStrength, intelligence } = storeToRefs(store)

const characterOptions = ['Barbar', 'Barde', 'Druide', 'Elf', 'Ritter', 'Zwerg', 'Zauberer']

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
})
</script>

<template>
  <main class="main-bg">
    <!-- Parchment card -->
    <div class="card-wrap">
      <!-- Corner ornaments -->
      <span class="ornament -top-5 -left-3">✦</span>
      <span class="ornament -top-5 -right-3">✦</span>
      <span class="ornament -bottom-5 -left-3">✦</span>
      <span class="ornament -bottom-5 -right-3">✦</span>

      <!-- Card body -->
      <div class="card">
        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="title">HeroQuest</h1>
          <div class="flex items-center gap-3 mt-2">
            <div class="divider-line"></div>
            <span class="ornament-inline">⚔</span>
            <p class="subtitle">Persönlichkeits-Pass</p>
            <span class="ornament-inline">⚔</span>
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
            <span class="ornament-inline text-xs">⚜</span>
            <div class="divider-line"></div>
          </div>

          <!-- Stats row -->
          <div class="stats-grid">
            <!-- Angriffswürfel: green -->
            <div class="stat-cell">
              <div class="diamond" style="border-color: var(--color-green)">
                <input
                  v-model.number="attackDice"
                  class="diamond-input"
                  max="99"
                  min="0"
                  placeholder="–"
                  type="number"
                />
              </div>
              <label class="stat-label">Angriffs-<br />würfel</label>
            </div>

            <!-- Verteidigungswürfel: red -->
            <div class="stat-cell">
              <div class="diamond" style="border-color: var(--color-red)">
                <input
                  v-model.number="defenseDice"
                  class="diamond-input"
                  max="99"
                  min="0"
                  placeholder="–"
                  type="number"
                />
              </div>
              <label class="stat-label">Verteidi-<br />gungs-<br />würfel</label>
            </div>

            <!-- Körperkraft: yellow -->
            <div class="stat-cell">
              <div class="diamond" style="border-color: var(--color-yellow)">
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

          <!-- Divider -->
          <div class="section-divider">
            <div class="divider-line"></div>
            <span class="ornament-inline text-xs">⚜</span>
            <div class="divider-line"></div>
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
          <p class="hint">Deine Werte werden automatisch gespeichert.</p>
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
  padding: 0.25rem 0;
}

.ornament {
  position: absolute;
  font-size: 1.5rem;
  user-select: none;
  color: var(--hq-ornament);
  transition: color 0.4s;
}

.ornament-inline {
  color: var(--hq-ornament);
  font-size: 1rem;
  transition: color 0.4s;
}

/* ── Stat diamonds ──────────────────────────────────────── */

/* 2×2 on mobile, 4×1 on wider screens */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 1rem;
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
  gap: 0.6rem;
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

  .ornament {
    font-size: 1.875rem;
  }

  .ornament-inline {
    font-size: 1.125rem;
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
</style>
