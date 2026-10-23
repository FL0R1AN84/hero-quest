import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'
import { weaponOptions } from '@/data/skillSheetData'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('Werkzeug', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('is an item, not a weapon', () => {
    expect(weaponOptions.some((w) => w.id === 'werkzeug')).toBe(false)
  })

  it('can be stacked with +/- and disappears when the last one is used', async () => {
    const store = useSkillSheetStore()
    store.character = 'Zwerg'
    const wrapper = mount(SkillSheetEquipment)
    const select = wrapper.findAll('select').find((s) => s.find('option[value="werkzeug"]').exists())!
    await select.setValue('werkzeug')
    await wrapper.find('.special-item-add-row .btn-add').trigger('click')
    expect(store.itemQuantities.werkzeug).toBe(1)

    const [minus, plus] = wrapper.findAll('.qty-btn')
    await plus!.trigger('click')
    expect(store.itemQuantities.werkzeug).toBe(2)
    await minus!.trigger('click')
    expect(store.itemQuantities.werkzeug).toBe(1)
    await plus!.trigger('click')

    const use = wrapper.findAll('.btn-use-item').find((b) => b.text().includes('Falle'))!
    await use.trigger('click')
    expect(store.itemQuantities.werkzeug).toBe(1)
    await use.trigger('click')
    expect(store.equippedSpecialItems).not.toContain('werkzeug')
    expect(store.itemQuantities.werkzeug).toBeUndefined()
  })

  it('allows stacking and throwing several Magische Wurfdolche', async () => {
    const store = useSkillSheetStore()
    store.character = 'Zwerg'
    const wrapper = mount(SkillSheetEquipment)
    const select = wrapper.findAll('select').find((s) => s.find('option[value="magischer-wurfdolch"]').exists())!
    await select.setValue('magischer-wurfdolch')
    await wrapper.find('.special-item-add-row .btn-add').trigger('click')
    await wrapper.findAll('.qty-btn')[1]!.trigger('click')
    expect(store.itemQuantities['magischer-wurfdolch']).toBe(2)

    const throwBtn = wrapper.findAll('.btn-use-item').find((b) => b.text().includes('Dolch werfen'))!
    await throwBtn.trigger('click')
    expect(store.itemQuantities['magischer-wurfdolch']).toBe(1)
    await throwBtn.trigger('click')
    expect(store.equippedSpecialItems).not.toContain('magischer-wurfdolch')
  })
})
