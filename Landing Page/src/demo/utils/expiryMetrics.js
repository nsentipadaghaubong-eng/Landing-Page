export function getEarliestExpiryDate(product) {
  if (!product) return null

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    let earliestTime = Infinity
    let targetDateString = null

    product.variants.forEach(v => {
      if (v.expiryDate && v.expiryDate !== "N/A" && String(v.expiryDate).trim() !== "") {
        const parsingTime = new Date(v.expiryDate).getTime()
        if (!isNaN(parsingTime) && parsingTime < earliestTime) {
          earliestTime = parsingTime
          targetDateString = v.expiryDate
        }
      }
    })
    return targetDateString
  }

  const topLevel = product.expiryDate
  if (topLevel && topLevel !== "N/A" && String(topLevel).trim() !== "") {
    return topLevel
  }
  return null
}

export function getDaysRemaining(expiryDateString) {
  if (!expiryDateString) return null

  const expiry = new Date(expiryDateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  return Math.round((expiry - today) / (24 * 60 * 60 * 1000))
}

export function isExpiringSoon(product, withinDays = 90) {
  const date = getEarliestExpiryDate(product)
  const days = getDaysRemaining(date)
  if (days === null) return false
  return days >= 0 && days <= withinDays
}

export function isExpired(product) {
  const date = getEarliestExpiryDate(product)
  const days = getDaysRemaining(date)
  if (days === null) return false
  return days < 0
}

export function buildExpiryEntries(products, predicate) {
  return products
    .filter(predicate)
    .map(product => {
      const expiryDate = getEarliestExpiryDate(product)
      return {
        product,
        expiryDate,
        daysRemaining: getDaysRemaining(expiryDate),
      }
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}

export function getExpiringSoonProducts(products, withinDays = 90) {
  return buildExpiryEntries(products, p => isExpiringSoon(p, withinDays))
}

export function getExpiredProducts(products) {
  return buildExpiryEntries(products, isExpired)
}
