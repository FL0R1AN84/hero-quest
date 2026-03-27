<script lang="ts" setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import {
  characterOptions,
  defaultStats,
  weaponOptions,
  armorOptions,
  specialItemOptions,
} from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { name, character, attackDice, defenseDice, bodyStrength, intelligence, equippedWeapon, equippedArmor, equippedSpecialItems } =
  storeToRefs(store)

watch(character, (newChar) => {
  const stats = defaultStats[newChar]
  if (stats) {
    attackDice.value = stats.attackDice
    defenseDice.value = stats.defenseDice
    bodyStrength.value = stats.bodyStrength
    intelligence.value = stats.intelligence
  }
  equippedWeapon.value = equippedWeapon.value.filter((id) => {
    const w = weaponOptions.find((w) => w.id === id)
    return !w?.allowedCharacters || w.allowedCharacters.includes(newChar)
  })
  equippedArmor.value = equippedArmor.value.filter((id) => {
    const a = armorOptions.find((a) => a.id === id)
    return !a?.allowedCharacters || a.allowedCharacters.includes(newChar)
  })
  equippedSpecialItems.value = equippedSpecialItems.value.filter((id) => {
    const item = specialItemOptions.find((i) => i.id === id)
    return !item?.allowedCharacters || item.allowedCharacters.includes(newChar)
  })
})
</script>

<template>
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
</template>

<style scoped>
.field-label {
  font-family: var(--font-fantasy), serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hq-label);
  transition: color 0.4s;
}

.field-input {
  background-color: var(--hq-card-bg-dark);
  border: none;
  border-bottom: 2px solid var(--hq-input-border);
  outline: none;
  padding: 0.5rem 0.5rem;
  font-family: var(--font-body), serif;
  font-size: 1rem;
  transition:
    border-color 0.2s,
    background-color 0.4s,
    color 0.4s;
  width: 100%;
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

@media (min-width: 480px) {
  .field-label {
    font-size: 0.75rem;
  }
}
</style>

