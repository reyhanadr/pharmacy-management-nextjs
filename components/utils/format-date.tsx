/**
 * Utility function to format date in Indonesian locale
 * @param dateString - The date string or Date object to format
 * @param options - Optional formatting options
 * @returns Formatted date string in Indonesian locale
 */
export function formatDate(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  const formatOptions = options || defaultOptions

  return new Date(dateString).toLocaleDateString("id-ID", formatOptions)
}

/**
 * Format date to short format (DD/MM/YYYY)
 * @param dateString - The date string or Date object to format
 * @returns Short formatted date string
 */
export function formatDateShort(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date to long format (without time)
 * @param dateString - The date string or Date object to format
 * @returns Long formatted date string without time
 */
export function formatDateLong(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}