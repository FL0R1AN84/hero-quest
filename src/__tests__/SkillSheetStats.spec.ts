import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetStats from '@/components/SkillSheetStats.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('Druide wolf form', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('enforces minimum attack and defense dice without changing base stats', async () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.attackDice = 1
    store.defenseDice = 2
    store.bodyStrength = 6
    const wrapper = mount(SkillSheetStats)
    const dice = () =>
      wrapper
        .findAll('.stat-cell .diamond-input')
        .slice(0, 2)
        .map((el) => el.text())

    expect(dice()).toEqual(['1', '2'])

    await wrapper.find('.druide-shape-btn').trigger('click')
    expect(dice()).toEqual(['3', '3'])
    const minusButtons = wrapper.findAll('.stat-cell .adj-minus').slice(0, 2)
    expect(minusButtons[0]?.attributes('disabled')).toBeDefined()
    expect(minusButtons[1]?.attributes('disabled')).toBeUndefined()

    await wrapper.find('.druide-shape-btn').trigger('click')
    expect(dice()).toEqual(['1', '2'])
    expect(store.attackDice).toBe(1)
    expect(store.defenseDice).toBe(2)
  })

  it('adds the transformation bonus on top of weapon and armor bonuses', async () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.attackDice = 2
    store.defenseDice = 3
    store.bodyStrength = 6
    store.equippedWeapon = ['dolch']
    store.equippedArmor = ['helm']
    const wrapper = mount(SkillSheetStats)
    const dice = () =>
      wrapper
        .findAll('.stat-cell .diamond-input')
        .slice(0, 2)
        .map((el) => el.text())

    expect(dice()).toEqual(['3', '4'])
    await wrapper.find('.druide-shape-btn').trigger('click')
    expect(dice()).toEqual(['4', '5'])
  })
})
