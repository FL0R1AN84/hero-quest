import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppWhatsNew from '@/components/AppWhatsNew.vue'

describe('AppWhatsNew', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('stays hidden on first start and when the version is unchanged', async () => {
    const wrapper = mount(AppWhatsNew, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).not.toContain('Update installiert')
    expect(localStorage.getItem('hq-last-seen-version')).toBe(__APP_VERSION__)
    wrapper.unmount()
    const again = mount(AppWhatsNew, { attachTo: document.body })
    await again.vm.$nextTick()
    expect(document.body.textContent).not.toContain('Update installiert')
    again.unmount()
  })

  it('shows old and new version after a version change and closes', async () => {
    localStorage.setItem('hq-last-seen-version', '0.0.1')
    const wrapper = mount(AppWhatsNew, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain('0.0.1')
    expect(document.body.textContent).toContain(__APP_VERSION__)
    ;(document.body.querySelector('.btn-close') as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).not.toContain('Update installiert')
    wrapper.unmount()
  })
})
