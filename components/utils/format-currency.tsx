/**
 * Utility function to format currency in Indonesian Rupiah (IDR)
 * @param amount - The numeric amount to format
 * @returns Formatted currency string in Indonesian locale
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount)
}

/**
 * Alternative function that allows custom locale and currency options
 * @param amount - The numeric amount to format
 * @param locale - The locale for formatting (default: "id-ID")
 * @param currency - The currency code (default: "IDR")
 * @returns Formatted currency string
 */
export function formatCurrencyCustom(
  amount: number,
  locale: string = "id-ID",
  currency: string = "IDR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}