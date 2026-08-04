const normalizeIdentifier = (value) => {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

const ANCILLARY_PREFIX = 'ancillary_'

// Backend numeric codes for POST /payment/generate/tuition
const TUITION_TYPE_BY_ID = {
  semester: 1,
  monthly: 2
}

/**
 * Resolve a selected payment type id into the backend request shape.
 * Tuition goes to /payment/generate/tuition with a numeric `type`;
 * ancillary goes to /payment/generate/ancillary with the row's `apid`.
 * Returns null for anything unrecognised.
 */
export const resolvePaymentTarget = (paymentTypeId) => {
  const type = TUITION_TYPE_BY_ID[paymentTypeId]
  if (type) return { kind: 'tuition', type }

  if (typeof paymentTypeId !== 'string') return null
  if (!paymentTypeId.startsWith(ANCILLARY_PREFIX)) return null

  const apid = Number(paymentTypeId.slice(ANCILLARY_PREFIX.length))
  if (!Number.isInteger(apid) || apid <= 0) return null

  return { kind: 'ancillary', apid }
}

/**
 * Find the price row for a class.
 *
 * Several programs share the same levelid, so levelid alone is ambiguous and
 * would pick whichever row happens to come first. The backend keys on
 * programid + levelid (controllers/payment.js generateTuition), so matching on
 * both here is what keeps the displayed price equal to the amount charged.
 */
export const findPriceForLevel = (prices, levelId, programId) => {
  const normalizedLevelId = normalizeIdentifier(levelId)
  const normalizedProgramId = normalizeIdentifier(programId)

  if (!normalizedLevelId || !normalizedProgramId) return null
  if (!Array.isArray(prices)) return null

  return prices.find(
    (price) =>
      normalizeIdentifier(price?.levelid) === normalizedLevelId &&
      normalizeIdentifier(price?.programid) === normalizedProgramId
  ) || null
}

export const findPaymentByIdentity = (payments, targetPayment) => {
  if (!Array.isArray(payments) || !targetPayment) return null

  const identityFields = [
    'paymentid',
    'midtrans_orderid',
    'midtrans_transactionid'
  ]

  for (const field of identityFields) {
    const targetValue = normalizeIdentifier(targetPayment[field])
    if (!targetValue) continue

    const match = payments.find(
      (payment) => normalizeIdentifier(payment?.[field]) === targetValue
    )

    if (match) return match
  }

  return null
}

export const getResumablePayment = (payments, targetPayment) => {
  const payment = findPaymentByIdentity(payments, targetPayment)

  if (!payment) return { payment: null, reason: 'not_found' }
  if (String(payment.status).toLowerCase() !== 'pending') {
    return { payment, reason: 'not_pending' }
  }
  if (!payment.token) return { payment, reason: 'missing_token' }

  return { payment, reason: null }
}
