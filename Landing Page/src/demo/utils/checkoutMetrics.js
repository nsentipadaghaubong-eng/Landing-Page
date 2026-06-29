/**
 * Resolves pricing/stock metrics from variant-first product schema.
 * Falls back to top-level product fields only when variants array is empty.
 */
export function resolveCheckoutMetrics(product, variantIdx = 0, mode = "unit") {
  if (!product) return null

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const source = hasVariants ? product.variants[variantIdx] : product
  if (!source) return null

  const unitsPerPack = Number(source.unitsPerPack || product.unitsPerPack || 1)
  const unitPrice = Number(source.unitSellingPrice ?? source.price ?? product.price ?? 0)
  const bulkPrice = Number(
    hasVariants
      ? (source.bulkSellingPrice ?? 0)
      : (source.bulkSellingPrice ?? product.bulkSellingPrice ?? 0)
  )
  const isBulk = mode === "bulk"
  const rate = isBulk
    ? (bulkPrice > 0 ? bulkPrice : unitPrice * unitsPerPack)
    : unitPrice

  const unitsAvailable = Number(
    hasVariants ? (source.quantity ?? 0) : (source.quantity ?? product.stock ?? 0)
  )
  const packsAvailable = Math.floor(unitsAvailable / unitsPerPack)

  const unitLabel = source.unitDispensingType || product.unitDispensingType || "Units"
  const bulkLabel = source.bulkPackagingType || product.bulkPackagingType || "Pack"

  return {
    hasVariants,
    source,
    unitsPerPack,
    unitPrice,
    bulkPrice,
    rate,
    unitsAvailable,
    packsAvailable,
    unitLabel,
    bulkLabel,
    isBulk,
  }
}

export function computeCheckoutTotals(metrics, sellQuantity) {
  const qty = Number(sellQuantity || 0)
  const totalRevenue = metrics.rate * qty
  const totalUnitsToDeduct = metrics.isBulk ? qty * metrics.unitsPerPack : qty
  return { totalRevenue, totalUnitsToDeduct, sellQuantity: qty }
}
