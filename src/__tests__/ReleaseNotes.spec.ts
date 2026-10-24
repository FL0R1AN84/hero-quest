import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppWhatsNew from '@/components/AppWhatsNew.vue'
import { parseReleaseNote } from '@/utils/releaseNotes'

describe('release notes', () => {
  it('parses conventional commit subjects', () => {
    expect(parseReleaseNote('feat: add new thing')).toEqual({ type: 'feat', text: 'Add new thing' })
    expect(parseReleaseNote('plain text')).toEqual({ type: '', text: 'plain text' })
  })

  describe('AppWhatsNew', () => {
    beforeEach(() => {
      localStorage.clear()
      document.body.innerHTML = ''
    })

    it('stays hidden on first start and when the version is unchanged', async () => {
      const wrapper = mount(AppWhatsNew, { attachTo: document.body })
      await wrapper.vm.$nextTick()
      expect(document.body.textContent).not.toContain('Update auf Version')
      expect(localStorage.getItem('hq-last-seen-version')).toBe(__APP_VERSION__)
      wrapper.unmount()
      const again = mount(AppWhatsNew, { attachTo: document.body })
      await again.vm.$nextTick()
      expect(document.body.textContent).not.toContain('Update auf Version')
      again.unmount()
    })

    it('shows the sheet after a version change and closes it', async () => {
      localStorage.setItem('hq-last-seen-version', '0.0.1')
      const wrapper = mount(AppWhatsNew, { attachTo: document.body })
      await wrapper.vm.$nextTick()
      expect(document.body.textContent).toContain(`Update auf Version ${__APP_VERSION__}`)
      ;(document.body.querySelector('.btn-close') as HTMLElement).click()
      await wrapper.vm.$nextTick()
      expect(document.body.textContent).not.toContain('Update auf Version')
      wrapper.unmount()
    })
  })
})
