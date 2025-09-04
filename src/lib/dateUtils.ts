/**
 * Utility functions for consistent date formatting across the application
 */

/**
 * Format a date string consistently across server and client components
 * This ensures the same date format regardless of timezone differences
 */
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Use toLocaleDateString with explicit timezone to ensure consistency
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC' // Force UTC to avoid timezone differences between server/client
  });
}

/**
 * Format a date for ISO string (used in JSON-LD and meta tags)
 */
export function formatISODate(dateString: string): string {
  return new Date(dateString).toISOString();
}
