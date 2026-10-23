<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { characterSkills } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { character, usedSkills } = storeToRefs(store)
const skills = computed(() => characterSkills[character.value] ?? [])

function isUsed(id: string): boolean {
  return usedSkills.value.includes(id)
}

function useSkill(id: string) {
  if (!isUsed(id)) usedSkills.value.push(id)
}
</script>

<template>
  <section v-if="skills.length" aria-labelledby="character-skills-title" class="character-skills">
    <h2 id="character-skills-title" class="character-skills-title">Fähigkeiten</h2>
    <button
      v-for="skill in skills"
      :key="skill.id"
      :class="{ 'character-skill--used': isUsed(skill.id) }"
      :disabled="isUsed(skill.id)"
      class="character-skill"
      type="button"
      @click="useSkill(skill.id)"
    >
      <span class="character-skill-icon">{{ skill.symbol }}</span>
      <span class="character-skill-content">
        <span class="character-skill-name">{{ skill.name }}</span>
        <span class="character-skill-description">
          <strong v-if="skill.requirement">{{ skill.requirement }} </strong>{{ skill.description }}
        </span>
      </span>
      <span class="character-skill-state">{{ isUsed(skill.id) ? '✕ BENUTZT' : '✦ Benutzen' }}</span>
    </button>
  </section>
</template>

<style scoped>
.character-skills {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.character-skills-title {
  font-family: var(--font-fantasy), serif;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hq-label);
  border-bottom: 1px solid var(--hq-divider);
  padding-bottom: 0.35rem;
}

.character-skill {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 0.65rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--hq-color-red);
  border-left-width: 3px;
  background-color: color-mix(in srgb, var(--hq-color-red) 8%, var(--hq-card-bg-dark));
  transition:
    opacity 0.2s,
    background-color 0.2s;
}

.character-skill:active:not(:disabled) {
  transform: scale(0.98);
}

.character-skill--used {
  cursor: default;
  opacity: 0.5;
  border-color: var(--hq-divider);
  background-color: transparent;
}

.character-skill-icon {
  font-size: 1.25rem;
  line-height: 1.2;
}

.character-skill-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.15rem;
}

.character-skill-name {
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  color: var(--hq-title);
}

.character-skill-description {
  font-family: var(--font-body), serif;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--hq-subtitle);
}

.character-skill-state {
  align-self: center;
  flex-shrink: 0;
  font-family: var(--font-fantasy), serif;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--hq-color-red);
}

.character-skill--used .character-skill-state {
  color: var(--hq-hint);
}
</style>
