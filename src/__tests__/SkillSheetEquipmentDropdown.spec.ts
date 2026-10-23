import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('Item dropdown', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('groups items into Tränke, Magische Gegenstände and Sonstiges', () => {
    useSkillSheetStore().character = 'Zwerg'
    const wrapper = mount(SkillSheetEquipment)
    const labels = wrapper.findAll('optgroup').map((g) => g.attributes('label'))
    expect(labels).toEqual(['🧪 Tränke', '✨ Magische Gegenstände', '📦 Sonstiges'])
    const potions = wrapper.findAll('optgroup')[0]!.findAll('option').map((o) => o.text())
    expect(potions).toContain('Heiltrank')
    expect(potions).toEqual([...potions].sort((a, b) => a.localeCompare(b)))
  })
})
