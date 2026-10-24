<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import ReleaseNotesList from '@/components/ReleaseNotesList.vue'

const STORAGE_KEY = 'hq-last-seen-version'

const version = __APP_VERSION__
const notes = __RELEASE_NOTES__
const visible = ref(false)

function close() {
  visible.value = false
}

onMounted(() => {
  const lastSeen = localStorage.getItem(STORAGE_KEY)
  localStorage.setItem(STORAGE_KEY, version)
  // First start has nothing to compare against, so only a real version change shows the sheet
  visible.value = lastSeen !== null && lastSeen !== version
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="whatsnew-overlay" @click.self="close">
        <div class="whatsnew-sheet" role="dialog" aria-modal="true">
          <div class="whatsnew-icon">🎉</div>
          <h3 class="whatsnew-title">Update auf Version {{ version }}</h3>
          <p class="whatsnew-message">HeroQuest wurde aktualisiert. Das ist neu:</p>
          <ReleaseNotesList :notes="notes" />
          <button class="btn-close" @click="close">✓ Verstanden</button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.whatsnew-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.whatsnew-sheet {
  background: var(--hq-card-bg);
  border: 2px solid var(--hq-input-border);
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.whatsnew-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.whatsnew-title {
  font-family: var(--font-fantasy), serif;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: var(--hq-input-text);
  text-align: center;
}

.whatsnew-message {
  font-family: var(--font-body), serif;
  font-size: 0.95rem;
  color: var(--hq-hint);
  margin: 0 0 1rem 0;
  text-align: center;
}

.btn-close {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--color-green) 0%, #5fdd7b 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-family: var(--font-fantasy), serif;
  font-weight: bold;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
