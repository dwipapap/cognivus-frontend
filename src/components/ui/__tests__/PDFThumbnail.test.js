import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PDFThumbnail from '../PDFThumbnail.vue'

describe('PDFThumbnail', () => {
  it('renders page navigation as an accessible native button', async () => {
    const wrapper = mount(PDFThumbnail, {
      props: {
        pdfDoc: null,
        pageNum: 3,
        isActive: true
      }
    })

    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Go to page 3')
    expect(button.attributes('aria-current')).toBe('page')

    await button.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
