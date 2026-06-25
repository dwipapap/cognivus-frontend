import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentOptionCard from '../PaymentOptionCard.vue'

const createWrapper = (props = {}) => mount(PaymentOptionCard, {
  props: {
    name: 'Pay Per Semester',
    price: 1000000,
    iconPath: 'M1 1',
    formatCurrency: (value) => `Rp ${value}`,
    ...props
  }
})

describe('PaymentOptionCard', () => {
  it('emits selection from an enabled native button', async () => {
    const wrapper = createWrapper()
    const button = wrapper.get('button')

    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('does not emit selection when pricing is unavailable', async () => {
    const wrapper = createWrapper({
      disabled: true,
      priceLabel: 'Unavailable'
    })
    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Unavailable')
    await button.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
