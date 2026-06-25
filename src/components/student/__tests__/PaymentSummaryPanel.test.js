import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentSummaryPanel from '../PaymentSummaryPanel.vue'

const createWrapper = (props = {}) => mount(PaymentSummaryPanel, {
  props: {
    studentName: 'Student A',
    studentEmail: 'student@example.com',
    paymentTypeName: 'Pay Per Semester',
    selected: true,
    amount: 1000000,
    canPay: true,
    formatCurrency: (value) => `Rp ${value}`,
    ...props
  },
  global: {
    stubs: {
      Drawer: {
        template: '<div><slot name="body" /><slot name="footer" /></div>'
      },
      Button: {
        inheritAttrs: false,
        emits: ['click'],
        template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
      }
    }
  }
})

describe('PaymentSummaryPanel', () => {
  it('renders the characterized payer, type, and total details', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Student A')
    expect(wrapper.text()).toContain('student@example.com')
    expect(wrapper.text()).toContain('Pay Per Semester')
    expect(wrapper.text()).toContain('Rp 1000000')
  })

  it('emits payment confirmation from the summary action', async () => {
    const wrapper = createWrapper()
    const confirmButton = wrapper.findAll('button').find(
      (button) => button.text().includes('Confirm & Pay')
    )

    await confirmButton.trigger('click')
    expect(wrapper.emitted('pay')).toHaveLength(1)
  })

  it('emits cancellation from the mobile selection bar', async () => {
    const wrapper = createWrapper()

    await wrapper.get('[aria-label="Cancel payment selection"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
