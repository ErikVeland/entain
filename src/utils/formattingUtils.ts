/**
 * Format currency amount (in cents) to dollars
 * @param cents The amount in cents
 * @returns Formatted currency string
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Format person name based on category
 * @param personName The person's name with possible prefix
 * @returns Formatted name
 */
export function formatPersonName(personName: string): string {
  if (!personName) return ''
  
  // Check if the name already has the prefix (J:, D:, or T:)
  if (personName.startsWith('J:') || personName.startsWith('D:') || personName.startsWith('T:')) {
    // Split the name into prefix and the rest
    const [prefix, ...nameParts] = personName.split(' ')
    
    if (nameParts.length === 0) {
      return prefix
    }
    
    if (nameParts.length === 1) {
      return `${prefix} ${nameParts[0]}`
    }
    
    // Return prefix with first initial and last name
    return `${prefix} ${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`
  }
  
  // Handle names without prefix (fallback)
  const parts = personName.trim().split(' ')
  
  if (parts.length === 1) {
    return parts[0]
  }
  
  // Return first initial and last name
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

/**
 * Get full person name without prefix
 * @param personName The person's name with possible prefix
 * @returns Full name without prefix
 */
export function getFullPersonName(personName: string): string {
  if (!personName) return ''
  
  // Check if the name has a prefix (J:, D:, or T:)
  if (personName.startsWith('J:') || personName.startsWith('D:') || personName.startsWith('T:')) {
    // Remove the prefix and return the rest of the name
    const parts = personName.split(' ')
    if (parts.length > 1) {
      return parts.slice(1).join(' ')
    }
    return personName
  }
  
  // Return the name as is if no prefix
  return personName
}