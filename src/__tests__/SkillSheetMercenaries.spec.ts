import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetMercenaries from '@/components/SkillSheetMercenaries.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('SkillSheetMercenaries', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('is hidden until the expansion is enabled', async () => {
    const store = useSkillSheetStore()
    const wrapper = mount(SkillSheetMercenaries)
    expect(wrapper.find('.equip-block').exists()).toBe(false)
    store.toggleExpansion('der-eisige-schrecken')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.equip-block').exists()).toBe(true)
    expect(wrapper.findAll('option')).toHaveLength(5)
  })

  it('hires and dismisses mercenaries', async () => {
    const store = useSkillSheetStore()
    store.toggleExpansion('der-eisige-schrecken')
    const wrapper = mount(SkillSheetMercenaries)
    await wrapper.find('select').setValue('spaeherin')
    await wrapper.find('.btn-add').trigger('click')
    expect(store.hiredMercenaries).toEqual(['spaeherin'])
    expect(wrapper.find('.equip-item--removable').text()).toContain('Fallen suchen')
    expect(wrapper.findAll('option')).toHaveLength(4)
    await wrapper.find('.equip-item-remove').trigger('click')
    expect(store.hiredMercenaries).toEqual([])
  })

  it('dismisses all mercenaries at the end of the game while keeping equipment and expansions', async () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.toggleExpansion('der-eisige-schrecken')
    store.hiredMercenaries = ['spaeherin', 'armbrustschuetze']
    store.equippedWeapon = ['dolch']
    store.equippedArmor = ['helm']
    store.equippedSpecialItems = ['ring-der-magie']
    const wrapper = mount(SkillSheetMercenaries)
    expect(wrapper.findAll('.equip-item--removable')).toHaveLength(2)

    store.resetStats()
    await wrapper.vm.$nextTick()

    expect(store.hiredMercenaries).toEqual([])
    expect(wrapper.findAll('.equip-item--removable')).toHaveLength(0)
    expect(wrapper.findAll('option')).toHaveLength(5)
    expect(store.enabledExpansions).toEqual(['der-eisige-schrecken'])
    expect(store.equippedWeapon).toEqual(['dolch'])
    expect(store.equippedArmor).toEqual(['helm'])
    expect(store.equippedSpecialItems).toEqual(['ring-der-magie'])
  })

  it('dismisses mercenaries even if their expansion was disabled', () => {
    const store = useSkillSheetStore()
    store.character = 'Druide'
    store.hiredMercenaries = ['spaeherin']

    store.resetStats()

    expect(store.hiredMercenaries).toEqual([])
    expect(store.enabledExpansions).toEqual([])
  })
})
