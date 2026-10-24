import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weaponOptions, armorOptions, specialItemOptions, defaultStats } from '@/data/skillSheetData'

export interface Kill {
  id: string
  matchDay: string  // ISO date string (YYYY-MM-DD)
  timestamp: number
}

export const useSkillSheetStore = defineStore(
  'skillSheet',
  () => {
    const name = ref('')
    const character = ref('')
    const attackDice = ref<number | null>(null)
    const defenseDice = ref<number | null>(null)
    const bodyStrength = ref<number | null>(null)
    const intelligence = ref<number | null>(null)

    const equippedWeapon = ref<string[]>([])
    const equippedArmor = ref<string[]>([])
    const equippedSpecialItems = ref<string[]>([])
    const usedSpecialItems = ref<string[]>([])
    const usedSkills = ref<string[]>([])
    const itemChargesUsed = ref<Record<string, number>>({})
    const itemQuantities = ref<Record<string, number>>({})
    const druideShapeShifted = ref(false)
    const kills = ref<Kill[]>([])
    // ids of expansions (see `expansionOptions`) the player has enabled; empty = base game only
    const enabledExpansions = ref<string[]>([])
    // ids of hired mercenaries (see `mercenaryOptions`)
    const hiredMercenaries = ref<string[]>([])

    const weaponBonus = computed(() =>
      equippedWeapon.value.reduce((sum, id) => {
        const w = weaponOptions.find((w) => w.id === id)
        return sum + (w?.bonus ?? 1)
      }, 0),
    )

    const armorBonus = computed(() =>
      equippedArmor.value.reduce((sum, id) => {
        const a = armorOptions.find((a) => a.id === id)
        return sum + (a?.bonus ?? 1)
      }, 0),
    )

    const intelligenceBonus = computed(() =>
      equippedSpecialItems.value.reduce((sum, id) => {
        const item = specialItemOptions.find((i) => i.id === id)
        return sum + (item?.passive && item?.intelligenceBonus ? item.intelligenceBonus : 0)
      }, 0),
    )

    const druideShapeBonus = computed(() => (character.value === 'Druide' && druideShapeShifted.value ? 1 : 0))

    // Get today's date in ISO format (YYYY-MM-DD)
    const getTodayDate = (): string => {
      const today = new Date()
      const isoString = today.toISOString()
      const dateOnly = isoString.split('T')[0]
      return dateOnly || '2026-08-04'
    }

    // Group kills by match day and get last 5 days
    const killsByMatchDay = computed(() => {
      const grouped: Record<string, Kill[]> = {}
      kills.value.forEach((kill) => {
        const day = kill.matchDay
        if (!grouped[day]) {
          grouped[day] = []
        }
        grouped[day].push(kill)
      })
      return grouped
    })

    const last5MatchDays = computed(() => {
      const sortedDays = Object.keys(killsByMatchDay.value).sort().reverse()
      return sortedDays.slice(0, 5)
    })

    const todayDate = computed((): string => {
      return getTodayDate()
    })

    const todayKills = computed(() => {
      const today = todayDate.value
      return today ? (killsByMatchDay.value[today] ?? []) : []
    })

    const totalKills = computed(() => kills.value.length)

    function reset() {
      name.value = ''
      character.value = ''
      attackDice.value = null
      defenseDice.value = null
      bodyStrength.value = null
      intelligence.value = null
      equippedWeapon.value = []
      equippedArmor.value = []
      equippedSpecialItems.value = []
      usedSpecialItems.value = []
      usedSkills.value = []
      itemChargesUsed.value = {}
      itemQuantities.value = {}
      druideShapeShifted.value = false
      kills.value = []
      enabledExpansions.value = []
      hiredMercenaries.value = []
    }

    function resetStats() {
      const stats = defaultStats[character.value]
      if (!stats) return
      attackDice.value = stats.attackDice
      defenseDice.value = stats.defenseDice
      bodyStrength.value = stats.bodyStrength
      intelligence.value = stats.intelligence
      druideShapeShifted.value = false
      usedSkills.value = []
    }

    function toggleDruideShape() {
      const maxBodyStrength = defaultStats['Druide']?.bodyStrength ?? 6
      if (character.value === 'Druide' && (bodyStrength.value ?? 0) >= maxBodyStrength) {
        druideShapeShifted.value = !druideShapeShifted.value
      }
    }

    function deactivateDruideShape() {
      druideShapeShifted.value = false
    }

    function addKill() {
      const today = new Date()
      const isoString = today.toISOString()
      const dateOnly = isoString.split('T')[0]
      const matchDay: string = dateOnly || '2026-08-04'

      const kill: Kill = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        matchDay: matchDay,
        timestamp: Date.now(),
      }
      kills.value.push(kill)
    }

    function removeKill(killId: string) {
      const index = kills.value.findIndex((k) => k.id === killId)
      if (index !== -1) {
        kills.value.splice(index, 1)
      }
    }

    function clearKills() {
      kills.value = []
    }

    function isExpansionEnabled(expansionId: string): boolean {
      return enabledExpansions.value.includes(expansionId)
    }

    function toggleExpansion(expansionId: string) {
      const idx = enabledExpansions.value.indexOf(expansionId)
      if (idx >= 0) {
        enabledExpansions.value.splice(idx, 1)
      } else {
        enabledExpansions.value.push(expansionId)
      }
    }

    return {
      name,
      character,
      attackDice,
      defenseDice,
      bodyStrength,
      intelligence,
      equippedWeapon,
      equippedArmor,
      equippedSpecialItems,
      usedSpecialItems,
      usedSkills,
      itemChargesUsed,
      itemQuantities,
      druideShapeShifted,
      kills,
      enabledExpansions,
      hiredMercenaries,
      killsByMatchDay,
      last5MatchDays,
      todayDate,
      todayKills,
      totalKills,
      weaponBonus,
      armorBonus,
      intelligenceBonus,
      druideShapeBonus,
      reset,
      resetStats,
      toggleDruideShape,
      deactivateDruideShape,
      addKill,
      removeKill,
      clearKills,
      isExpansionEnabled,
      toggleExpansion,
    }
  },
  {
    persist: {
      // Werkzeug moved from weapons to items: migrate saved state
      afterHydrate: ({ store }) => {
        const idx = store.equippedWeapon.indexOf('werkzeug')
        if (idx < 0) return
        store.equippedWeapon.splice(idx, 1)
        if (!store.equippedSpecialItems.includes('werkzeug')) {
          store.equippedSpecialItems.push('werkzeug')
          store.itemQuantities = { ...store.itemQuantities, werkzeug: 1 }
        }
      },
    },
  },
)
