import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('Equipment removal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('removes weapons, armor and items only via the X button', async () => {
    const store = useSkillSheetStore()
    store.character = 'Zwerg'
    store.equippedWeapon = ['dolch']
    store.equippedArmor = ['helm']
    store.equippedSpecialItems = ['ring-des-feuers', 'amulett-der-weisheit']
    const wrapper = mount(SkillSheetEquipment)

    await wrapper.find('.equip-item-content').trigger('click')
    for (const el of wrapper.findAll('.equip-item')) await el.trigger('click')
    for (const el of wrapper.findAll('.equip-item-toggle')) await el.trigger('click')
    expect(store.equippedWeapon).toEqual(['dolch'])
    expect(store.equippedArmor).toEqual(['helm'])
    expect(store.equippedSpecialItems).toHaveLength(2)

    const removes = wrapper.findAll('.equip-item-remove')
    expect(removes).toHaveLength(4)
    for (const btn of removes) await btn.trigger('click')
    expect(store.equippedWeapon).toEqual([])
    expect(store.equippedArmor).toEqual([])
    expect(store.equippedSpecialItems).toEqual([])
  })

  it('asks for confirmation before removing a potion', async () => {
    const store = useSkillSheetStore()
    store.character = 'Zwerg'
    store.equippedSpecialItems = ['heiltrank']
    store.itemQuantities = { heiltrank: 2 }
    const wrapper = mount(SkillSheetEquipment)
    const confirmSpy = vi.spyOn(window, 'confirm')

    confirmSpy.mockReturnValueOnce(false)
    await wrapper.find('.equip-item-remove').trigger('click')
    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(store.equippedSpecialItems).toEqual(['heiltrank'])

    confirmSpy.mockReturnValueOnce(true)
    await wrapper.find('.equip-item-remove').trigger('click')
    expect(store.equippedSpecialItems).toEqual([])
  })
})
