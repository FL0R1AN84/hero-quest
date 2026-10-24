<script lang="ts" setup>
import { computed } from 'vue'
import { noteIcon, parseReleaseNotes } from '@/utils/releaseNotes'

const props = defineProps<{ notes: string[] }>()
const parsed = computed(() => parseReleaseNotes(props.notes))
</script>

<template>
  <ul v-if="parsed.length" class="release-notes">
    <li v-for="(note, i) in parsed" :key="i">
      <span class="note-icon">{{ noteIcon(note.type) }}</span>
      <span>{{ note.text }}</span>
    </li>
  </ul>
</template>

<style scoped>
.release-notes {
  list-style: none;
  margin: 0 0 1.25rem 0;
  padding: 0;
  max-height: 40vh;
  overflow-y: auto;
  font-family: var(--font-body), serif;
  font-size: 0.85rem;
  color: var(--hq-input-text);
  text-align: left;
}

.release-notes li {
  display: flex;
  gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--hq-input-border);
  line-height: 1.35;
}

.release-notes li:last-child {
  border-bottom: none;
}

.note-icon {
  flex-shrink: 0;
}
</style>
