<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { mercenaryOptions } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { enabledExpansions, hiredMercenaries } = storeToRefs(store)

const selectedToHire = ref('')

const unlocked = computed(() => mercenaryOptions.filter((m) => enabledExpansions.value.includes(m.expansion)))
const available = computed(() => unlocked.value.filter((m) => !hiredMercenaries.value.includes(m.id)))
const hired = computed(() => unlocked.value.filter((m) => hiredMercenaries.value.includes(m.id)))

function hire() {
  if (!selectedToHire.value || hiredMercenaries.value.includes(selectedToHire.value)) return
  hiredMercenaries.value.push(selectedToHire.value)
  selectedToHire.value = ''
}

function dismiss(id: string) {
  const idx = hiredMercenaries.value.indexOf(id)
  if (idx >= 0) hiredMercenaries.value.splice(idx, 1)
}
</script>

<template>
  <div v-if="unlocked.length" class="equip-block">
    <div class="equip-block-header">
      <span class="equip-block-label">❄️ Söldner</span>
      <span :class="hired.length ? 'equip-badge--active' : 'equip-badge--inactive'" class="equip-badge"
        >{{ hired.length }} 👥</span
      >
    </div>

    <div class="equip-list">
      <div v-if="!hired.length" class="equip-item equip-item--placeholder">
        <span class="equip-item-placeholder">Keine Söldner angeheuert</span>
      </div>

      <div v-for="m in hired" :key="m.id" class="equip-item equip-item--removable equip-item--selected">
        <span class="equip-item-icon">{{ m.symbol }}</span>
        <span class="equip-item-content">
          <span class="equip-item-name">{{ m.label }}</span>
          <span class="merc-stats">
            <span>👣 {{ m.movement }}</span>
            <span>⚔️ {{ m.attackDice }}</span>
            <span>🛡 {{ m.defenseDice }}</span>
            <span>❤️ {{ m.bodyStrength }}</span>
            <span>🧠 {{ m.intelligence }}</span>
          </span>
          <span v-if="m.ability" class="equip-item-note">{{ m.ability }}</span>
        </span>
        <button
          :aria-label="`${m.label} entlassen`"
          class="equip-item-remove"
          title="Entlassen"
          type="button"
          @click="dismiss(m.id)"
        >
          ✕
        </button>
      </div>

      <div v-if="available.length" class="equip-add-row">
        <select v-model="selectedToHire" aria-label="Söldner auswählen">
          <option value="">Söldner anheuern…</option>
          <option v-for="m in available" :key="m.id" :value="m.id">{{ m.symbol }} {{ m.label }}</option>
        </select>
        <button :disabled="!selectedToHire" class="btn-add" type="button" @click="hire">Anheuern</button>
      </div>
    </div>

    <p class="equip-item-note">
      Gilt für ein Abenteuer (nicht in Abenteuer 1–3). Söldner handeln direkt nach dem Zug ihres Helden und tragen keine
      Ausrüstung.
    </p>
  </div>
</template>

<style scoped>
.equip-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-block: 0.25rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
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
  color: var(--hq-label);
}

.equip-badge {
  font-family: var(--font-fantasy), serif;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.5rem;
  border: 1px solid;
  border-radius: 999px;
}

.equip-badge--inactive {
  color: var(--hq-hint);
  border-color: var(--hq-divider);
}

.equip-badge--active {
  color: var(--color-blue);
  border-color: var(--color-blue);
  background-color: color-mix(in srgb, var(--color-blue) 12%, transparent);
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
  text-align: left;
}

.equip-item--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-style: dashed;
}

.equip-item-placeholder {
  font-family: var(--font-body), serif;
  font-style: italic;
  font-size: 0.7rem;
  color: var(--hq-input-placeholder);
  text-align: center;
}

.equip-item--removable {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 2.25rem 0.55rem 0.65rem;
  min-height: 2.75rem;
}

.equip-item--selected {
  border-color: var(--color-blue);
  background-color: color-mix(in srgb, var(--color-blue) 8%, var(--hq-card-bg-dark));
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
}

.equip-item-note {
  font-family: var(--font-body), serif;
  font-style: italic;
  font-size: 0.65rem;
  color: var(--hq-hint);
  line-height: 1.3;
}

.merc-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-family: var(--font-body), serif;
  font-size: 0.75rem;
  color: var(--hq-subtitle);
}

.equip-item-remove {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  line-height: 1;
  color: var(--hq-hint);
  background: transparent;
  border: 1px solid var(--hq-divider);
  border-radius: 50%;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.equip-item-remove:hover {
  color: var(--hq-color-red);
  border-color: var(--hq-color-red);
}

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

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
