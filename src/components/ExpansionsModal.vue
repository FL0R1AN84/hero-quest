<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { expansionOptions } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { enabledExpansions } = storeToRefs(store)

const isOpen = ref(false)
const feedbackMessage = ref('')
const feedbackKey = ref(0)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

function showFeedback(message: string) {
  if (feedbackTimer !== undefined) {
    clearTimeout(feedbackTimer)
  }
  feedbackMessage.value = message
  feedbackKey.value += 1
  feedbackTimer = setTimeout(() => {
    feedbackMessage.value = ''
    feedbackTimer = undefined
  }, 1400)
}

function toggleModal() {
  navigator.vibrate?.(20)
  isOpen.value = !isOpen.value
  showFeedback(isOpen.value ? 'Erweiterungen geöffnet' : 'Erweiterungen geschlossen')
}

function closeModal() {
  isOpen.value = false
}

function isActive(id: string): boolean {
  return enabledExpansions.value.includes(id)
}

onUnmounted(() => {
  if (feedbackTimer !== undefined) {
    clearTimeout(feedbackTimer)
  }
})
</script>

<template>
  <div class="expansions-container">
    <transition name="action-feedback">
      <div v-if="feedbackMessage" :key="feedbackKey" class="action-feedback" role="status" aria-live="polite">
        {{ feedbackMessage }}
      </div>
    </transition>

    <!-- Toggle Button -->
    <button
      :class="{ active: isOpen }"
      class="expansions-btn"
      title="Erweiterungen"
      @click="toggleModal"
      @selectstart.prevent
    >
      <span class="book-icon">📖</span>
      <span v-if="enabledExpansions.length > 0" class="expansions-badge">{{ enabledExpansions.length }}</span>
    </button>

    <!-- Modal Overlay -->
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal"></div>
    </transition>

    <!-- Modal Dialog -->
    <transition name="modal-slide">
      <div v-if="isOpen" class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Erweiterungen 📖</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-content">
          <p class="expansions-hint">
            Aktiviere Erweiterungen, um ihre neuen Waffen, Rüstungen und Gegenstände in der Ausrüstung freizuschalten.
            Mehrere Erweiterungen können gleichzeitig aktiv sein.
          </p>

          <ul class="expansions-list">
            <li v-for="expansion in expansionOptions" :key="expansion.id">
              <button
                :class="{ 'expansion-item--active': isActive(expansion.id) }"
                class="expansion-item"
                type="button"
                @click="store.toggleExpansion(expansion.id)"
              >
                <span class="expansion-item-icon">{{ expansion.symbol }}</span>
                <span class="expansion-item-name">{{ expansion.label }}</span>
                <span class="expansion-item-state">{{ isActive(expansion.id) ? '✓ AKTIV' : 'AKTIVIEREN' }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.expansions-container {
  position: relative;
}

.action-feedback {
  position: fixed;
  right: var(--space-4);
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--space-5));
  left: var(--space-4);
  z-index: var(--z-feedback);
  width: fit-content;
  max-width: calc(100vw - var(--space-8));
  margin: 0 auto;
  padding: var(--space-3) var(--space-5);
  border: 2px solid var(--color-gold);
  border-radius: var(--radius-pill);
  background-color: var(--hq-card-bg-dark);
  box-shadow:
    0 0 1.25rem var(--hq-card-shadow),
    0 0 0.75rem color-mix(in srgb, var(--color-red) 35%, transparent);
  color: var(--hq-title);
  font-weight: 700;
  text-align: center;
  pointer-events: none;
  animation: feedback-pop 1.4s ease both;
}

@keyframes feedback-pop {
  0% {
    transform: translateY(0.75rem) scale(0.92);
    opacity: 0;
  }

  12%,
  82% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 0;
  }
}

/* Toggle Button */
.expansions-btn {
  position: relative;
  width: var(--size-control);
  height: var(--size-control);
  border: 2px solid var(--hq-input-border);
  border-radius: var(--radius-md);
  background-color: var(--hq-card-bg);
  color: var(--hq-label);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color var(--duration-fast),
    border-color var(--duration-fast),
    color var(--duration-fast);
  font-size: var(--font-size-item-icon);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.expansions-btn:hover {
  background-color: var(--hq-card-bg-dark);
  border-color: var(--hq-input-border-focus);
}

.expansions-btn.active {
  border-color: var(--color-gold);
  background-color: var(--hq-card-bg-dark);
}

.expansions-btn:active {
  transform: scale(0.95);
}

.book-icon {
  display: block;
}

.expansions-badge {
  position: absolute;
  top: var(--space-badge-offset);
  right: var(--space-badge-offset);
  background-color: var(--color-gold);
  color: var(--color-charcoal);
  border-radius: var(--radius-circle);
  width: var(--size-badge);
  height: var(--size-badge);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-label);
  font-weight: bold;
  border: 2px solid var(--hq-card-bg);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--hq-overlay);
  z-index: var(--z-modal-overlay);
}

/* Modal Dialog */
.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: var(--size-modal-max);
  max-height: 80vh;
  background-color: var(--hq-card-bg);
  border: var(--border-width-heavy) solid var(--hq-card-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 0 60px var(--hq-card-shadow);
  display: flex;
  flex-direction: column;
  z-index: var(--z-modal-dialog);
  animation: slideIn var(--duration-normal) ease-out;
  overscroll-behavior: contain;
}

@keyframes slideIn {
  from {
    transform: translate(-50%, -45%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: var(--border-width-default) solid var(--hq-divider);
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-item-icon);
  letter-spacing: 0.1em;
  color: var(--hq-title);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--hq-label);
  cursor: pointer;
  padding: 0;
  width: var(--size-modal-close);
  height: var(--size-modal-close);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--duration-fast);
}

.close-btn:hover {
  color: var(--color-red);
}

/* Modal Content */
.modal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: var(--space-4);
  gap: var(--space-4);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.expansions-hint {
  margin: 0;
  font-family: var(--font-body), serif;
  font-size: 0.8rem;
  line-height: var(--line-height-text);
  color: var(--hq-subtitle);
}

.expansions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.expansion-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--hq-divider);
  border-left-width: 3px;
  border-left-color: var(--hq-divider);
  background-color: transparent;
  transition:
    opacity var(--duration-fast),
    background-color var(--duration-fast),
    border-color var(--duration-fast);
}

.expansion-item:active {
  transform: scale(0.98);
}

.expansion-item--active {
  border-left-color: var(--color-gold);
  background-color: color-mix(in srgb, var(--color-gold) 10%, var(--hq-card-bg-dark));
}

.expansion-item-icon {
  font-size: var(--font-size-item-icon);
  line-height: var(--line-height-compact);
}

.expansion-item-name {
  flex: 1;
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-button);
  color: var(--hq-title);
}

.expansion-item-state {
  flex-shrink: 0;
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-tiny);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--hq-hint);
}

.expansion-item--active .expansion-item-state {
  color: var(--color-gold);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--duration-normal) ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition:
    opacity var(--duration-normal) ease,
    transform var(--duration-normal) ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
</style>
