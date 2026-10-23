import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import SkillSheetSkills from '@/components/SkillSheetSkills.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('SkillSheetSkills', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the three Berserker skills only for the Berserker', () => {
    const store = useSkillSheetStore()
    store.character = 'Berserker'
    const wrapper = mount(SkillSheetSkills)
    expect(wrapper.findAll('button')).toHaveLength(3)

    const other = mount(SkillSheetSkills)
    store.character = 'Barbar'
    return other.vm.$nextTick().then(() => expect(other.find('section').exists()).toBe(false))
  })

  it('disables a used skill until the end of the game resets it', async () => {
    const store = useSkillSheetStore()
    store.character = 'Berserker'
    const wrapper = mount(SkillSheetSkills)

    await wrapper.findAll('button')[0]!.trigger('click')
    expect(store.usedSkills).toEqual(['berserker-wut'])
    expect(wrapper.findAll('button')[0]!.attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button')[1]!.attributes('disabled')).toBeUndefined()

    store.resetStats()
    await wrapper.vm.$nextTick()
    expect(store.usedSkills).toEqual([])
    expect(wrapper.findAll('button')[0]!.attributes('disabled')).toBeUndefined()
  })
})
