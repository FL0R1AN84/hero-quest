<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showUpdatePrompt = ref(false)
let registration: ServiceWorkerRegistration | null = null

function handleUpdateAvailable(event: Event) {
  const customEvent = event as CustomEvent<{ registration: ServiceWorkerRegistration }>
  registration = customEvent.detail.registration
  showUpdatePrompt.value = true
}

function acceptUpdate() {
  if (!registration?.waiting) return

  // Tell the SW to skip waiting
  registration.waiting.postMessage({ type: 'SKIP_WAITING' })

  // Reload after a brief delay to allow the new SW to take over
  setTimeout(() => {
    window.location.reload()
  }, 200)
}

function dismissUpdate() {
  showUpdatePrompt.value = false
}

onMounted(() => {
  window.addEventListener('sw-update-available', handleUpdateAvailable)
})

onUnmounted(() => {
  window.removeEventListener('sw-update-available', handleUpdateAvailable)
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="showUpdatePrompt" class="update-overlay">
        <div class="update-prompt">
          <div class="update-icon">🔄</div>
          <h3 class="update-title">Neue Version verfügbar</h3>
          <p class="update-message">
            Eine neue Version von HeroQuest ist verfügbar. Möchtest du die App aktualisieren?
          </p>
          <div class="update-actions">
            <button class="btn-update" @click="acceptUpdate">
              ✓ Aktualisieren
            </button>
            <button class="btn-dismiss" @click="dismissUpdate">
              ✕ Später
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.update-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.update-prompt {
  background: var(--hq-card-bg);
  border: 2px solid var(--hq-input-border);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.update-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.update-title {
  font-family: var(--font-fantasy), serif;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.75rem 0;
  color: var(--hq-input-text);
  text-align: center;
}

.update-message {
  font-family: var(--font-body), serif;
  font-size: 0.95rem;
  color: var(--hq-hint);
  margin: 0 0 1.25rem 0;
  text-align: center;
  line-height: 1.5;
}

.update-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column-reverse;
}

.btn-update {
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--color-green) 0%, #5fdd7b 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-update:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 150, 0, 0.3);
}

.btn-update:active {
  transform: translateY(0);
}

.btn-dismiss {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--hq-card-bg-dark);
  color: var(--hq-hint);
  border: 1px solid var(--hq-input-border);
  border-radius: 4px;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dismiss:hover {
  background: var(--hq-input-border);
  color: var(--hq-input-text);
}

.btn-dismiss:active {
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 480px) {
  .update-prompt {
    padding: 2rem;
    border-radius: 12px;
  }

  .update-actions {
    flex-direction: row;
  }

  .btn-update,
  .btn-dismiss {
    padding: 0.875rem 1.25rem;
  }
}
</style>

