<script lang="ts" setup>
import { useSkillSheetStore } from '@/stores/skillSheet'
import SkillSheetHeader from '@/components/SkillSheetHeader.vue'
import SkillSheetHeroFields from '@/components/SkillSheetHeroFields.vue'
import SkillSheetAvatar from '@/components/SkillSheetAvatar.vue'
import SkillSheetStats from '@/components/SkillSheetStats.vue'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'

const store = useSkillSheetStore()

function saveToFile() {
  const data = {
    name: store.name,
    character: store.character,
    attackDice: store.attackDice,
    defenseDice: store.defenseDice,
    bodyStrength: store.bodyStrength,
    intelligence: store.intelligence,
    equippedWeapon: [...store.equippedWeapon],
    equippedArmor: [...store.equippedArmor],
    equippedSpecialItems: [...store.equippedSpecialItems],
    usedSpecialItems: [...store.usedSpecialItems],
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.name || 'Held'}_${store.character}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function loadFromFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      store.$patch({
        name: data.name ?? '',
        character: data.character ?? '',
        attackDice: data.attackDice ?? null,
        defenseDice: data.defenseDice ?? null,
        bodyStrength: data.bodyStrength ?? null,
        intelligence: data.intelligence ?? null,
        equippedWeapon: data.equippedWeapon ?? [],
        equippedArmor: data.equippedArmor ?? [],
        equippedSpecialItems: data.equippedSpecialItems ?? [],
        usedSpecialItems: data.usedSpecialItems ?? [],
      })
    } catch {
      alert('Ungültige Datei – bitte eine gültige JSON-Skillsheet-Datei wählen.')
    }
  }
  input.click()
}
</script>

<template>
  <main class="main-bg">
    <div class="card-wrap">
      <div class="card">
        <SkillSheetHeader />

        <form class="space-y-5" @submit.prevent>
          <SkillSheetHeroFields />

          <div class="section-divider">
            <div class="divider-line"></div>
          </div>

          <SkillSheetAvatar />

          <div class="section-divider">
            <div class="divider-line"></div>
          </div>

          <SkillSheetStats />

          <SkillSheetEquipment />

          <div class="flex gap-3 pt-1">
            <button class="btn-load" type="button" @click="loadFromFile">Laden</button>
            <button :disabled="!store.character" class="btn-save" type="button" @click="saveToFile">Speichern</button>
          </div>

          <p class="hint">Deine Werte werden automatisch im Browser gespeichert.</p>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-bg {
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background-color: var(--hq-bg);
  transition: background-color 0.4s;
}

.card-wrap {
  position: relative;
  width: 100%;
  max-width: 32rem;
}

.card {
  background-color: var(--hq-card-bg);
  border: none;
  border-radius: 0;
  overflow: hidden;
  min-height: 100dvh;
  padding: calc(1.25rem + env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
    calc(2rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  box-shadow: none;
  transition:
    background-color 0.4s,
    border-color 0.4s;
}

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

.btn-save,
.btn-load {
  flex: 1;
  font-family: var(--font-fantasy), serif;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 2px solid var(--hq-card-border);
  padding: 0.75rem 1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  min-height: 3rem;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.4s;
}

.btn-save {
  background-color: var(--hq-btn-save-bg);
  color: var(--hq-btn-save-text);
}

.btn-save:hover {
  background-color: var(--hq-btn-save-hover-bg);
  color: var(--hq-btn-save-hover-text);
}

.btn-load {
  background-color: transparent;
}

.btn-load:hover {
  background-color: var(--hq-divider);
}

.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-save:active,
.btn-load:active {
  transform: scale(0.97);
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

@media (min-width: 480px) {
  .main-bg {
    align-items: center;
    padding: 1.5rem;
  }

  .card {
    border: 4px solid var(--hq-card-border);
    border-radius: 2px;
    min-height: unset;
    padding: 2rem 2rem 2.5rem;
    box-shadow: 0 0 60px var(--hq-card-shadow);
  }
}
</style>
