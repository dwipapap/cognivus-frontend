import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContinuePaymentOverlay from '../ContinuePaymentOverlay.vue'

const overlayStub = {
  props: ['open'],
  emits: ['update:open'],
  template: '<div><slot name="body" /><slot name="footer" /></div>'
}

const buttonStub = {
  inheritAttrs: false,
  props: ['label'],
  emits: ['click'],
  template: '<button type="button" @click="$emit(\'click\')">{{ label }}</button>'
}

const createWrapper = (props = {}) => mount(ContinuePaymentOverlay, {
  props: {
    open: true,
    payment: {
      payment_type: 'semester',
      amount: 1000000,
      midtrans_orderid: 'ORDER-1',
      created_at: '2026-06-25'
    },
    getPaymentTypeName: () => 'Pay Per Semester',
    formatCurrency: (value) => `Rp ${value}`,
    formatDate: () => 'June 25, 2026',
    ...props
  },
  global: {
    stubs: {
      Modal: overlayStub,
      Slideover: overlayStub,
      Button: buttonStub,
      Icon: true
    }
  }
})

describe('ContinuePaymentOverlay', () => {
  it('renders the pending payment details on desktop', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Pay Per Semester')
    expect(wrapper.text()).toContain('Rp 1000000')
    expect(wrapper.text()).toContain('ORDER-1')
    expect(wrapper.text()).toContain('June 25, 2026')
  })

  it('emits pay and cancel without owning payment orchestration', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')

    await buttons.find((button) => button.text() === 'Pay Now').trigger('click')
    await buttons.find((button) => button.text() === 'Cancel').trigger('click')

    expect(wrapper.emitted('pay')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders the mobile continuation copy when requested', () => {
    const wrapper = createWrapper({ isMobile: true })

    expect(wrapper.text()).toContain('Tap below to reopen the payment window')
  })
})
