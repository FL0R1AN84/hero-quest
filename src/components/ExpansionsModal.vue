<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { expansionOptions } from '@/data/skillSheetData'

const store = useSkillSheetStore()
const { enabledExpansions } = storeToRefs(store)

const isOpen = ref(false)

function toggleModal() {
  isOpen.value = !isOpen.value
}

function closeModal() {
  isOpen.value = false
}

function isActive(id: string): boolean {
  return enabledExpansions.value.includes(id)
}
</script>

<template>
  <div class="expansions-container">
    <!-- Toggle Button -->
    <button :class="{ active: isOpen }" class="expansions-btn" title="Erweiterungen" @click="toggleModal">
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
            Aktiviere Erweiterungen, um ihre neuen Waffen, Rüstungen und Gegenstände in der Ausrüstung
            freizuschalten. Mehrere Erweiterungen können gleichzeitig aktiv sein.
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

/* Toggle Button */
.expansions-btn {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--hq-input-border);
  border-radius: 4px;
  background-color: var(--hq-card-bg);
  color: var(--hq-label);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
  font-size: 1.25rem;
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
  top: -0.5rem;
  right: -0.5rem;
  background-color: var(--color-gold);
  color: #2a2a2a;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Modal Dialog */
.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 28rem;
  max-height: 80vh;
  background-color: var(--hq-card-bg);
  border: 3px solid var(--hq-card-border);
  border-radius: 2px;
  box-shadow: 0 0 60px var(--hq-card-shadow);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
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
  padding: 1.5rem;
  border-bottom: 2px solid var(--hq-divider);
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-fantasy), serif;
  font-size: 1.25rem;
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
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f67449;
}

/* Modal Content */
.modal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 1rem;
  gap: 1rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.expansions-hint {
  margin: 0;
  font-family: var(--font-body), serif;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--hq-subtitle);
}

.expansions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
    opacity 0.2s,
    background-color 0.2s,
    border-color 0.2s;
}

.expansion-item:active {
  transform: scale(0.98);
}

.expansion-item--active {
  border-left-color: var(--color-gold);
  background-color: color-mix(in srgb, var(--color-gold) 10%, var(--hq-card-bg-dark));
}

.expansion-item-icon {
  font-size: 1.25rem;
  line-height: 1.2;
}

.expansion-item-name {
  flex: 1;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  color: var(--hq-title);
}

.expansion-item-state {
  flex-shrink: 0;
  font-family: var(--font-fantasy), serif;
  font-size: 0.6rem;
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
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
</style>
