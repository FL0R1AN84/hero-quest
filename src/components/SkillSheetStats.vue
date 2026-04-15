<script lang="ts" setup>
import { computed } from 'vue'
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
</script>

<template>
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
        <input v-model.number="bodyStrength" class="diamond-input" max="99" min="0" placeholder="–" type="number" />
      </div>
      <label class="stat-label">Körper-<br />kraft</label>
    </div>

    <!-- Intelligenz: blue -->
    <div class="stat-cell">
      <div class="diamond" style="border-color: var(--color-blue)">
        <span v-if="!character" class="diamond-input diamond-placeholder">–</span>
        <input
          v-else
          v-model.number="effectiveIntelligence"
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
</template>

<style scoped>
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

.stat-diamond-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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


/* Hide number spinners */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>

