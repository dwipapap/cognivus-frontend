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
      { levelid: 1, programid: 21, harga: 1000000 },
      { levelid: 2, programid: 21, harga: 2000000 }
    ]

    expect(findPriceForLevel(prices, '2', '21')).toEqual(prices[1])
    expect(findPriceForLevel(prices, 3, 21)).toBeNull()
    expect(findPriceForLevel(prices, null, 21)).toBeNull()
  })

  it('picks the row for the class programme when several share a level', () => {
    // Real data: levelid 1 exists under three programmes at wildly different
    // prices. Matching on levelid alone silently charged the first one.
    const prices = [
      { priceid: 4, levelid: 1, programid: 22, harga: 20000000 },
      { priceid: 7, levelid: 1, programid: 21, harga: 2500000 },
      { priceid: 6, levelid: 1, programid: 19, harga: 1000000000 }
    ]

    expect(findPriceForLevel(prices, 1, 21)).toEqual(prices[1])
    expect(findPriceForLevel(prices, 1, 22)).toEqual(prices[0])
  })

  it('refuses to guess a price when the programme is unknown', () => {
    const prices = [{ levelid: 1, programid: 21, harga: 2500000 }]

    expect(findPriceForLevel(prices, 1, null)).toBeNull()
    expect(findPriceForLevel(prices, 1, undefined)).toBeNull()
    expect(findPriceForLevel(prices, 1, 99)).toBeNull()
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
