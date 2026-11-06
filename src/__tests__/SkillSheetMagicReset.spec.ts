import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('Magic item end-of-game reset', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('restores a used Stab der Magie without replenishing potions', async () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.equippedSpecialItems = ['stab-der-magie', 'heiltrank']
    store.usedSpecialItems = ['heiltrank']
    const wrapper = mount(SkillSheetEquipment)
    const staff = wrapper
      .findAll('.equip-item--special-wrap')
      .find((item) => item.text().includes('Stab der Magie'))!

    await staff.find('.btn-use-item').trigger('click')
    expect(store.usedSpecialItems).toContain('stab-der-magie')
    expect(staff.find('.btn-restore-item').exists()).toBe(true)

    store.resetStats()
    await wrapper.vm.$nextTick()
    expect(store.usedSpecialItems).toEqual(['heiltrank'])
    expect(store.equippedSpecialItems).toEqual(['stab-der-magie', 'heiltrank'])
    expect(staff.find('.btn-use-item').exists()).toBe(true)
    expect(staff.find('.btn-restore-item').exists()).toBe(false)
  })

  it('also restores the Ring der Rückkehr', () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.usedSpecialItems = ['ring-der-rueckkehr', 'heiltrank']
    store.resetStats()
    expect(store.usedSpecialItems).toEqual(['heiltrank'])
  })
})
