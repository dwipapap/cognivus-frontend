import { describe, expect, it } from 'vitest'
import {
  findPaymentByIdentity,
  findPriceForLevel,
  getResumablePayment,
  resolvePaymentTarget
} from '../payment'

describe('payment utilities', () => {
  it('routes tuition selections to the numeric backend type', () => {
    expect(resolvePaymentTarget('semester')).toEqual({ kind: 'tuition', type: 1 })
    expect(resolvePaymentTarget('monthly')).toEqual({ kind: 'tuition', type: 2 })
  })

  it('routes ancillary selections to the row apid', () => {
    expect(resolvePaymentTarget('ancillary_6')).toEqual({
      kind: 'ancillary',
      apid: 6
    })
  })

  it('rejects payment types the backend cannot generate', () => {
    expect(resolvePaymentTarget('ancillary_')).toBeNull()
    expect(resolvePaymentTarget('ancillary_0')).toBeNull()
    expect(resolvePaymentTarget('ancillary_abc')).toBeNull()
    expect(resolvePaymentTarget('unknown')).toBeNull()
    expect(resolvePaymentTarget(null)).toBeNull()
  })

  it('returns only the price configured for the requested level', () => {
    const prices = [
      { levelid: 1, harga: 1000000 },
      { levelid: 2, harga: 2000000 }
    ]

    expect(findPriceForLevel(prices, '2')).toEqual(prices[1])
    expect(findPriceForLevel(prices, 3)).toBeNull()
    expect(findPriceForLevel(prices, null)).toBeNull()
  })

  it('reconciles a payment using stable backend identifiers', () => {
    const refreshed = [
      { paymentid: 10, midtrans_orderid: 'ORDER-10', status: 'pending' }
    ]

    expect(findPaymentByIdentity(refreshed, { paymentid: '10' })).toEqual(
      refreshed[0]
    )
  })

  it('does not resume when refreshed backend state is no longer pending', () => {
    const refreshed = [
      {
        paymentid: 10,
        midtrans_orderid: 'ORDER-10',
        status: 'success',
        token: 'stale-token'
      }
    ]

    expect(getResumablePayment(refreshed, {
      paymentid: 10,
      status: 'pending',
      token: 'original-token'
    })).toEqual({
      payment: refreshed[0],
      reason: 'not_pending'
    })
  })

  it('uses the refreshed pending payment and its current token', () => {
    const refreshed = [
      {
        paymentid: 10,
        status: 'pending',
        token: 'refreshed-token'
      }
    ]

    expect(getResumablePayment(refreshed, {
      paymentid: 10,
      status: 'pending',
      token: 'original-token'
    })).toEqual({
      payment: refreshed[0],
      reason: null
    })
  })
})
