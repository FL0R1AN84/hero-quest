<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { characterAvatars } from '@/data/skillSheetData'

const { character } = storeToRefs(useSkillSheetStore())
</script>

<template>
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
</template>

<style scoped>
.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-inline);
  padding: var(--space-1) 0;
}

.avatar-frame {
  width: var(--size-avatar);
  height: var(--size-avatar);
  border-radius: var(--radius-circle);
  border: var(--border-width-heavy) solid;
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
  font-size: var(--font-size-avatar-symbol);
  line-height: var(--line-height-tight);
  transition: color 0.3s;
}

.avatar-symbol--empty {
  font-size: var(--font-size-xl);
  color: var(--hq-input-placeholder);
}

.avatar-name {
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-small-plus);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hq-label);
  transition: color 0.4s;
}
</style>
