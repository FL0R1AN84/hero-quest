import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import ExpansionsModal from '@/components/ExpansionsModal.vue'
import SkillSheetEquipment from '@/components/SkillSheetEquipment.vue'
import SkillSheetHeroFields from '@/components/SkillSheetHeroFields.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'
import { expansionOptions, specialItemOptions } from '@/data/skillSheetData'

describe('Expansions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('registers "Der eisige Schrecken" as the first expansion', () => {
    expect(expansionOptions.map((e) => e.id)).toContain('der-eisige-schrecken')
  })

  it('toggles an expansion on and off via the store', () => {
    const store = useSkillSheetStore()
    expect(store.enabledExpansions).toEqual([])
    expect(store.isExpansionEnabled('der-eisige-schrecken')).toBe(false)

    store.toggleExpansion('der-eisige-schrecken')
    expect(store.enabledExpansions).toEqual(['der-eisige-schrecken'])
    expect(store.isExpansionEnabled('der-eisige-schrecken')).toBe(true)

    store.toggleExpansion('der-eisige-schrecken')
    expect(store.enabledExpansions).toEqual([])
    expect(store.isExpansionEnabled('der-eisige-schrecken')).toBe(false)
  })

  it('clears enabled expansions on a full reset', () => {
    const store = useSkillSheetStore()
    store.toggleExpansion('der-eisige-schrecken')
    store.reset()
    expect(store.enabledExpansions).toEqual([])
  })

  it('renders a toggle row for every registered expansion and reflects store state', async () => {
    const store = useSkillSheetStore()
    const wrapper = mount(ExpansionsModal)
    await wrapper.find('.expansions-btn').trigger('click')

    const rows = wrapper.findAll('.expansion-item')
    expect(rows).toHaveLength(expansionOptions.length)
    expect(rows[0]!.text()).toContain('Der eisige Schrecken')
    expect(rows[0]!.text()).toContain('AKTIVIEREN')

    await rows[0]!.trigger('click')
    expect(store.enabledExpansions).toEqual(['der-eisige-schrecken'])
    expect(wrapper.findAll('.expansion-item')[0]!.text()).toContain('AKTIV')
  })

  it('hides expansion-tagged equipment until its expansion is enabled', async () => {
    const store = useSkillSheetStore()
    store.character = 'Zwerg'

    // Temporarily tag an existing item with the new expansion to verify filtering end-to-end.
    const item = specialItemOptions.find((i) => i.id === 'werkzeug')!
    const original = item.expansion
    item.expansion = 'der-eisige-schrecken'
    try {
      const wrapper = mount(SkillSheetEquipment)
      const optionLabelsBefore = wrapper.findAll('option').map((o) => o.text())
      expect(optionLabelsBefore).not.toContain('Werkzeug')

      store.toggleExpansion('der-eisige-schrecken')
      await wrapper.vm.$nextTick()
      const optionLabelsAfter = wrapper.findAll('option').map((o) => o.text())
      expect(optionLabelsAfter).toContain('Werkzeug')
    } finally {
      item.expansion = original
    }
  })
})

describe('Expansion characters', () => {
  it('lists Barbarin with an ice icon only when the expansion is enabled', async () => {
    setActivePinia(createPinia())
    const store = useSkillSheetStore()
    const wrapper = mount(SkillSheetHeroFields)
    expect(wrapper.text()).not.toContain('Barbarin')
    store.toggleExpansion('der-eisige-schrecken')
    await wrapper.vm.$nextTick()
    const labels = wrapper.findAll('option').map((o) => o.text())
    expect(labels).toContain('❄️ Barbarin')
    store.character = 'Barbarin'
    await wrapper.vm.$nextTick()
    expect(store.bodyStrength).toBe(8)
  })
})
