import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PaymentOptionCard from '../PaymentOptionCard.vue'
import PaymentOptionsPanel from '../PaymentOptionsPanel.vue'

const regularPaymentTypes = [
  {
    id: 'semester',
    name: 'Pay Per Semester',
    description: 'Full semester',
    icon: 'M1 1'
  },
  {
    id: 'monthly',
    name: 'Pay Per Month',
    description: 'One month',
    icon: 'M2 2'
  }
]

const createWrapper = (props = {}) => shallowMount(PaymentOptionsPanel, {
  props: {
    regularPaymentTypes,
    ancillaryPaymentTypes: [],
    semesterFee: 1000000,
    monthlyFee: 200000,
    regularPricingAvailable: true,
    formatCurrency: (value) => `Rp ${value}`,
    ...props
  },
  global: {
    stubs: {
      UAlert: true
    }
  }
})

describe('PaymentOptionsPanel', () => {
  it('keeps regular options unavailable when level pricing is missing', () => {
    const wrapper = createWrapper({ regularPricingAvailable: false })
    const cards = wrapper.findAllComponents(PaymentOptionCard)

    expect(cards).toHaveLength(2)
    expect(cards.every((card) => card.props('disabled'))).toBe(true)
    expect(cards.every((card) => card.props('priceLabel') === 'Unavailable')).toBe(true)
  })

  it('emits the selected regular payment type', async () => {
    const wrapper = createWrapper()
    const semesterCard = wrapper.findAllComponents(PaymentOptionCard)[0]

    semesterCard.vm.$emit('select')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toEqual([['semester']])
  })

  it('keeps ancillary fees selectable independently of regular pricing', async () => {
    const wrapper = createWrapper({
      regularPricingAvailable: false,
      ancillaryPaymentTypes: [{
        id: 'ancillary_1',
        name: 'Exam Fee',
        description: '',
        icon: 'M3 3',
        price: 150000
      }]
    })
    const ancillaryCard = wrapper.findAllComponents(PaymentOptionCard)[2]

    expect(ancillaryCard.props('disabled')).toBe(false)
    ancillaryCard.vm.$emit('select')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toEqual([['ancillary_1']])
  })
})
