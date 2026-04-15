import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weaponOptions, armorOptions, specialItemOptions } from '@/data/skillSheetData'

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
      weaponBonus,
      armorBonus,
      intelligenceBonus,
      reset,
    }
  },
  { persist: true },
)
