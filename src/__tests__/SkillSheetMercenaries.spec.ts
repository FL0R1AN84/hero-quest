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
})
