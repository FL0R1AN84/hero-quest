import { ref } from 'vue'
import { defineStore } from 'pinia'

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
      reset,
    }
  },
  { persist: true },
)
