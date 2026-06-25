const normalizeIdentifier = (value) => {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export const findPriceForLevel = (prices, levelId) => {
  const normalizedLevelId = normalizeIdentifier(levelId)

  if (!normalizedLevelId || !Array.isArray(prices)) return null

  return prices.find(
    (price) => normalizeIdentifier(price?.levelid) === normalizedLevelId
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
