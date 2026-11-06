<script lang="ts" setup>
import { ref, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSkillSheetStore } from '@/stores/skillSheet'

const store = useSkillSheetStore()
const { totalKills, todayDate, last5MatchDays, killsByMatchDay } = storeToRefs(store)

const isOpen = ref(false)
const addButtonRef = ref<HTMLButtonElement>()
const isAnimatingButton = ref(false)
const recentKillIds = ref<Set<string>>(new Set())
const badgeAnimationKey = ref(0)
const expandedDay = ref<string | null>(null)
let pressTimer: ReturnType<typeof setTimeout> | undefined
const isPressing = ref(false)
const longPressTriggered = ref(false)
const feedbackMessage = ref('')
const feedbackKey = ref(0)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

function vibrate(pattern: number | number[]) {
  navigator.vibrate?.(pattern)
}

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

function startButtonPress(event: PointerEvent) {
  if (pressTimer !== undefined) {
    clearTimeout(pressTimer)
  }
  isPressing.value = true
  longPressTriggered.value = false
  const button = event.currentTarget
  if (button instanceof HTMLButtonElement) {
    button.setPointerCapture?.(event.pointerId)
  }
  pressTimer = setTimeout(() => {
    if (!isPressing.value) return
    longPressTriggered.value = true
    vibrate([20, 30, 20])
    showFeedback('Todesliste geöffnet')
    toggleModal()
  }, 600)
}

function finishButtonPress() {
  if (!isPressing.value) return
  isPressing.value = false
  if (pressTimer !== undefined) {
    clearTimeout(pressTimer)
    pressTimer = undefined
  }
  if (!longPressTriggered.value) {
    vibrate(20)
    addKill()
  }
  longPressTriggered.value = false
}

function cancelButtonPress() {
  isPressing.value = false
  if (pressTimer !== undefined) {
    clearTimeout(pressTimer)
    pressTimer = undefined
  }
  longPressTriggered.value = false
}

function handleButtonClick(event: MouseEvent) {
  if (event.detail === 0) {
    addKill()
  }
}

function toggleModal() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // Keep accordion behavior deterministic: open the most recent day when modal opens.
    expandedDay.value = last5MatchDays.value[0] ?? todayDate.value ?? null
  }
}

function closeModal() {
  isOpen.value = false
  expandedDay.value = null
  cancelButtonPress()
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
  showFeedback(`Kill gezählt · Gesamt: ${totalKills.value}`)

  // Mark the new kill as recent for animation
  const newKill = store.kills[store.kills.length - 1]
  if (newKill) {
    recentKillIds.value.add(newKill.id)
    setTimeout(() => {
      recentKillIds.value.delete(newKill.id)
    }, 1000)
  }
}

onUnmounted(() => {
  cancelButtonPress()
  if (feedbackTimer !== undefined) {
    clearTimeout(feedbackTimer)
  }
})

function isRecentKill(killId: string): boolean {
  return recentKillIds.value.has(killId)
}

function toggleDayExpansion(day: string) {
  expandedDay.value = expandedDay.value === day ? null : day
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
    <transition name="action-feedback">
      <div v-if="feedbackMessage" :key="feedbackKey" class="action-feedback" role="status" aria-live="polite">
        {{ feedbackMessage }}
      </div>
    </transition>

    <!-- Toggle Button -->
    <button
      :class="{ active: isOpen, pressing: isPressing, 'long-press': longPressTriggered }"
      class="kill-list-btn"
      title="Kurz drücken: Kill zählen, lange drücken: Todesliste öffnen"
      @click="handleButtonClick"
      @contextmenu.prevent
      @pointercancel="cancelButtonPress"
      @pointerdown="startButtonPress"
      @pointerup="finishButtonPress"
      @selectstart.prevent
    >
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
            <button ref="addButtonRef" :class="{ animating: isAnimatingButton }" class="btn-add-kill" @click="addKill">
              + Kill hinzufügen
            </button>
          </div>

          <!-- Kill Stats -->
          <div class="kill-stats">
            <p class="stat-line">
              <strong>Gesamt Kills:</strong>
              <span :class="{ pulse: totalKills > 0 }" class="stat-value">{{ totalKills }}</span>
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
                <div
                  :class="{ expanded: expandedDay === item.day }"
                  class="match-day-header"
                  @click="toggleDayExpansion(item.day)"
                >
                  <h3 class="match-day-title">{{ formatMatchDay(item.day) }}</h3>
                  <span class="match-day-count">{{ item.kills.length }}</span>
                  <span class="expand-icon">{{ expandedDay === item.day ? '▼' : '▶' }}</span>
                </div>

                <transition name="expand">
                  <ul v-if="expandedDay === item.day" class="kill-list">
                    <li
                      v-for="(kill, index) in item.kills"
                      :key="kill.id"
                      :class="{ 'kill-new': isRecentKill(kill.id) }"
                      class="kill-item"
                    >
                      <div class="kill-content">
                        <span class="kill-number">{{ index + 1 }}</span>
                        <span class="kill-time">{{ formatTime(kill.timestamp) }}</span>
                      </div>
                      <button class="btn-delete-kill" title="Kill löschen" @click="deleteKill(kill.id)">✕</button>
                    </li>
                  </ul>
                </transition>
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
.kill-list-btn {
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
  touch-action: none;
}

.kill-list-btn.pressing {
  border-color: var(--color-gold);
  background-color: var(--hq-card-bg-dark);
}

.kill-list-btn.pressing::before {
  position: absolute;
  inset: -0.5rem;
  border: 2px solid var(--color-gold);
  border-radius: 8px;
  content: '';
  pointer-events: none;
  animation: press-feedback 0.8s ease-in-out infinite alternate;
}

.kill-list-btn.pressing::after {
  position: absolute;
  inset: 0.2rem;
  border: 2px solid var(--color-gold);
  border-radius: var(--radius-circle);
  content: '';
  pointer-events: none;
  animation: long-press-progress 600ms linear forwards;
}

@keyframes press-feedback {
  from {
    opacity: 0.55;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-gold) 18%, transparent);
  }

  to {
    opacity: 1;
    box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--color-gold) 35%, transparent);
  }
}

.kill-list-btn.long-press::after {
  animation: none;
  background-color: color-mix(in srgb, var(--color-white) 12%, transparent);
}

@keyframes long-press-progress {
  from {
    transform: scale(0.35);
    opacity: 0.35;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
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
  top: var(--space-badge-offset);
  right: var(--space-badge-offset);
  background-color: var(--color-red);
  color: var(--color-white);
  border-radius: var(--radius-circle);
  width: var(--size-badge);
  height: var(--size-badge);
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
  overflow: hidden;
}

/* Add Kill Section */
.add-kill-section {
  flex-shrink: 0;
}

.btn-add-kill {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background-color: var(--hq-btn-save-bg);
  color: var(--hq-btn-save-text);
  border: 2px solid var(--hq-card-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-fantasy), serif;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    background-color var(--duration-fast),
    color var(--duration-fast);
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
  padding: var(--space-3);
  background-color: var(--hq-card-bg-dark);
  border-radius: var(--radius-sm);
}

.stat-line {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-fantasy), serif;
  font-size: var(--font-size-button);
  color: var(--hq-label);
}

.stat-value {
  font-weight: bold;
  color: var(--color-red);
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
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
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
  overflow: visible;
}

.match-day-group {
  border: 2px solid var(--hq-divider);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--hq-card-bg-dark);
}

.match-day-header {
  display: grid;
  grid-template-columns: 1fr 2.25rem 1.25rem;
  align-items: center;
  column-gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: color-mix(in srgb, var(--color-gold) 15%, transparent);
  border-bottom: 2px solid var(--hq-divider);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--duration-fast);
}

.match-day-header:hover {
  background-color: color-mix(in srgb, var(--color-gold) 25%, transparent);
}

.match-day-title {
  font-family: var(--font-fantasy), serif;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: var(--hq-title);
  margin: 0;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-day-count {
  font-family: var(--font-fantasy), serif;
  background-color: var(--color-red);
  color: var(--color-white);
  width: 2.25rem;
  padding: 0.25rem 0;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  justify-self: center;
}

.expand-icon {
  font-size: 0.75rem;
  color: var(--hq-label);
  margin-left: 0;
  transition: transform var(--duration-normal) ease;
  flex-shrink: 0;
  justify-self: end;
}

/* Kill List */
.kill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: block;
  max-height: 50rem;
}

.kill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-left: 3px solid var(--color-gold);
  transition: background-color var(--duration-fast);
}

.kill-item:hover {
  background-color: color-mix(in srgb, var(--color-gold) 10%, transparent);
}

.kill-item.kill-new {
  animation: killItemSlideIn 0.5s ease-out;
  background-color: color-mix(in srgb, var(--color-gold) 20%, transparent) !important;
  border-left: 3px solid var(--color-red);
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
  color: var(--color-red);
  font-size: var(--font-size-button);
  cursor: pointer;
  padding: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color var(--duration-fast),
    transform var(--duration-fast);
  flex-shrink: 0;
}

.btn-delete-kill:hover {
  color: var(--color-danger-hover);
  transform: scale(1.1);
}

.btn-delete-kill:active {
  transform: scale(0.95);
}

/* Modal Footer */
.modal-footer {
  padding: var(--space-4);
  border-top: 2px solid var(--hq-divider);
  flex-shrink: 0;
}

.btn-clear-all {
  width: 100%;
  padding: 0.75rem;
  background-color: color-mix(in srgb, var(--color-danger) 8%, transparent);
  color: var(--color-danger-light);
  border: 2px solid color-mix(in srgb, var(--color-danger) 50%, transparent);
  border-radius: 2px;
  font-family: var(--font-fantasy), serif;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color var(--duration-fast),
    color var(--duration-fast),
    border-color var(--duration-fast);
}

.btn-clear-all:hover {
  background-color: color-mix(in srgb, var(--color-danger) 18%, transparent);
  color: var(--color-danger-lighter);
  border-color: color-mix(in srgb, var(--color-danger) 80%, transparent);
}

.btn-clear-all:active {
  transform: scale(0.97);
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

/* Expand/Collapse transition for kill lists */
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height var(--duration-normal) ease,
    opacity var(--duration-normal) ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
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
    width: var(--size-control-compact);
    height: var(--size-control-compact);
    font-size: var(--font-size-icon);
  }

  .kill-badge {
    width: var(--size-badge-small);
    height: var(--size-badge-small);
    font-size: var(--font-size-tiny);
  }
}

/* ── Kill Animations ─────────────────────────────────── */

@keyframes killButtonPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-red) 70%, transparent);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px transparent;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
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
    color: var(--color-red);
  }
  50% {
    transform: scale(1.15);
    color: var(--color-danger-glow);
  }
  100% {
    transform: scale(1);
    color: var(--color-red);
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
