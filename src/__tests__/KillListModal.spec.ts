import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KillListModal from '@/components/KillListModal.vue'
import { useSkillSheetStore } from '@/stores/skillSheet'

describe('KillListModal button', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts a kill on a short press without opening the modal', () => {
    const wrapper = mount(KillListModal)
    const button = wrapper.get('.kill-list-btn')

    button.element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    button.element.dispatchEvent(new Event('pointerup', { bubbles: true }))

    expect(useSkillSheetStore().totalKills).toBe(1)
    expect(wrapper.find('.modal-dialog').exists()).toBe(false)
  })

  it('opens the modal on a long press without counting a kill', async () => {
    const wrapper = mount(KillListModal)
    const button = wrapper.get('.kill-list-btn')

    button.element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    vi.advanceTimersByTime(600)
    await wrapper.vm.$nextTick()
    expect(button.classes()).toContain('long-press')
    button.element.dispatchEvent(new Event('pointerup', { bubbles: true }))

    expect(useSkillSheetStore().totalKills).toBe(0)
    expect(wrapper.find('.modal-dialog').exists()).toBe(true)
  })

  it('counts a kill when activated by keyboard', async () => {
    const wrapper = mount(KillListModal)

    await wrapper.get('.kill-list-btn').trigger('click')

    expect(useSkillSheetStore().totalKills).toBe(1)
  })
})
