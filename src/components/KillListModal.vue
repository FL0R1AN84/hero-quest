<script lang="ts" setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'

const store = useSkillSheetStore()
const { totalKills, todayDate, last5MatchDays, killsByMatchDay } = storeToRefs(store)

const isOpen = ref(false)
const addButtonRef = ref<HTMLButtonElement>()
const isAnimatingButton = ref(false)
const recentKillIds = ref<Set<string>>(new Set())
const badgeAnimationKey = ref(0)

function toggleModal() {
  isOpen.value = !isOpen.value
}

function closeModal() {
  isOpen.value = false
}

function addKill() {
  // Trigger button animation
  if (addButtonRef.value) {
    isAnimatingButton.value = true
    setTimeout(() => {
      isAnimatingButton.value = false
    }, 600)
  }

  // Trigger badge animation
  badgeAnimationKey.value += 1

  // Add the kill
  store.addKill()

  // Mark the new kill as recent for animation
  const newKill = store.kills[store.kills.length - 1]
  if (newKill) {
    recentKillIds.value.add(newKill.id)
    setTimeout(() => {
      recentKillIds.value.delete(newKill.id)
    }, 1000)
  }
}

function isRecentKill(killId: string): boolean {
  return recentKillIds.value.has(killId)
}

function deleteKill(killId: string) {
  store.removeKill(killId)
}

function clearAll() {
  if (confirm('Alle Kills löschen?')) {
    store.clearKills()
  }
}

function formatMatchDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')

  const isToday = dateStr === todayDate.value

  if (isToday) {
    return 'Heute'
  }

  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const killsForDisplay = computed(() => {
  return last5MatchDays.value.map((day) => ({
    day,
    kills: killsByMatchDay.value[day] || [],
  }))
})
</script>

<template>
  <div class="kill-list-container">
    <!-- Toggle Button -->
    <button class="kill-list-btn" :class="{ active: isOpen }" @click="toggleModal" title="Todesliste">
      <span class="skull-icon">💀</span>
      <span v-if="totalKills > 0" :key="badgeAnimationKey" class="kill-badge">{{ totalKills }}</span>
    </button>

    <!-- Modal Overlay -->
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal"></div>
    </transition>

    <!-- Modal Dialog -->
    <transition name="modal-slide">
      <div v-if="isOpen" class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Todesliste 💀</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-content">
          <!-- Add Button -->
          <div class="add-kill-section">
            <button
              ref="addButtonRef"
              class="btn-add-kill"
              :class="{ animating: isAnimatingButton }"
              @click="addKill"
            >
              + Kill hinzufügen
            </button>
          </div>

          <!-- Kill Stats -->
          <div class="kill-stats">
            <p class="stat-line">
              <strong>Gesamt Kills:</strong>
              <span class="stat-value" :class="{ pulse: totalKills > 0 }">{{ totalKills }}</span>
            </p>
          </div>

          <!-- Match Days -->
          <div class="match-days-wrapper">
            <div v-if="totalKills === 0" class="empty-state">
              <p>Noch keine Kills registriert.</p>
              <p class="hint">Klicke auf "+ Kill hinzufügen" um Kills zu registrieren!</p>
            </div>

            <div v-else class="match-days-container">
              <div v-for="item in killsForDisplay" :key="item.day" class="match-day-group">
                <div class="match-day-header">
                  <h3 class="match-day-title">{{ formatMatchDay(item.day) }}</h3>
                  <span class="match-day-count">{{ item.kills.length }}</span>
                </div>

                <ul class="kill-list">
                  <li
                    v-for="(kill, index) in item.kills"
                    :key="kill.id"
                    class="kill-item"
                    :class="{ 'kill-new': isRecentKill(kill.id) }"
                  >
                    <div class="kill-content">
                      <span class="kill-number">{{ index + 1 }}</span>
                      <span class="kill-time">{{ formatTime(kill.timestamp) }}</span>
                    </div>
                    <button class="btn-delete-kill" @click="deleteKill(kill.id)" title="Kill löschen">✕</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Clear All Button -->
          <div v-if="totalKills > 0" class="modal-footer">
            <button class="btn-clear-all" @click="clearAll">Alle löschen</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.kill-list-container {
  position: relative;
}

/* Toggle Button */
.kill-list-btn {
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

.kill-list-btn:hover {
  background-color: var(--hq-card-bg-dark);
  border-color: var(--hq-input-border-focus);
}

.kill-list-btn.active {
  border-color: var(--color-gold);
  background-color: var(--hq-card-bg-dark);
}

.kill-list-btn:active {
  transform: scale(0.95);
}

.skull-icon {
  display: block;
}

.kill-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #f67449;
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  border: 2px solid var(--hq-card-bg);
  animation: killBadgePulse 0.6s ease-out;
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
}

/* Add Kill Section */
.add-kill-section {
  flex-shrink: 0;
}

.btn-add-kill {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--hq-btn-save-bg);
  color: var(--hq-btn-save-text);
  border: 2px solid var(--hq-card-border);
  border-radius: 2px;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-add-kill:hover {
  background-color: var(--hq-btn-save-hover-bg);
  color: var(--hq-btn-save-hover-text);
}

.btn-add-kill:active {
  transform: scale(0.97);
}

.btn-add-kill.animating {
  animation: killButtonPulse 0.6s ease-out;
}

/* Kill Stats */
.kill-stats {
  padding: 0.75rem;
  background-color: var(--hq-card-bg-dark);
  border-radius: 2px;
}

.stat-line {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  color: var(--hq-label);
}

.stat-value {
  font-weight: bold;
  color: #f67449;
  font-size: 1.1rem;
}

.stat-value.pulse {
  animation: statsValuePulse 0.6s ease-out;
}

/* Match Days Wrapper */
.match-days-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  color: var(--hq-hint);
  font-family: var(--font-body), serif;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-state .hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.match-days-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
}

.match-day-group {
  border: 2px solid var(--hq-divider);
  border-radius: 2px;
  overflow: hidden;
  background-color: var(--hq-card-bg-dark);
}

.match-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(201, 168, 76, 0.15);
  border-bottom: 2px solid var(--hq-divider);
}

.match-day-title {
  font-family: var(--font-fantasy), serif;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: var(--hq-title);
  margin: 0;
  font-weight: 600;
}

.match-day-count {
  font-family: var(--font-fantasy), serif;
  background-color: #f67449;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Kill List */
.kill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-left: 3px solid var(--color-gold);
  transition: background-color 0.2s;
}

.kill-item:hover {
  background-color: rgba(201, 168, 76, 0.1);
}

.kill-item.kill-new {
  animation: killItemSlideIn 0.5s ease-out;
  background-color: rgba(201, 168, 76, 0.2) !important;
  border-left: 3px solid #f67449;
}

.kill-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.kill-number {
  font-family: var(--font-fantasy), serif;
  font-size: 0.8rem;
  color: var(--color-gold);
  font-weight: bold;
  min-width: 1.5rem;
  text-align: right;
}

.kill-time {
  font-family: var(--font-body), serif;
  font-size: 0.8rem;
  color: var(--hq-subtitle);
}

.btn-delete-kill {
  background: none;
  border: none;
  color: #f67449;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s,
    transform 0.2s;
  flex-shrink: 0;
}

.btn-delete-kill:hover {
  color: #ff6b5a;
  transform: scale(1.1);
}

.btn-delete-kill:active {
  transform: scale(0.95);
}

/* Modal Footer */
.modal-footer {
  padding: 1rem;
  border-top: 2px solid var(--hq-divider);
  flex-shrink: 0;
}

.btn-clear-all {
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(180, 60, 60, 0.08);
  color: #c06060;
  border: 2px solid rgba(180, 60, 60, 0.5);
  border-radius: 2px;
  font-family: var(--font-fantasy), serif;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.btn-clear-all:hover {
  background-color: rgba(180, 60, 60, 0.18);
  color: #e07070;
  border-color: rgba(180, 60, 60, 0.8);
}

.btn-clear-all:active {
  transform: scale(0.97);
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

/* Mobile adjustments */
@media (max-width: 480px) {
  .modal-dialog {
    width: calc(100vw - 2rem);
    max-height: 90vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .kill-list-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.1rem;
  }

  .kill-badge {
    width: 1.1rem;
    height: 1.1rem;
    font-size: 0.6rem;
  }
}

/* ── Kill Animations ─────────────────────────────────── */

@keyframes killButtonPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(246, 116, 73, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(246, 116, 73, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(246, 116, 73, 0);
  }
}

@keyframes killItemSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes statsValuePulse {
  0% {
    transform: scale(1);
    color: #f67449;
  }
  50% {
    transform: scale(1.15);
    color: #ff8566;
  }
  100% {
    transform: scale(1);
    color: #f67449;
  }
}

@keyframes killBadgePulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>

