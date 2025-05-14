/**
 * Utility functions for consistent date formatting across server and client.
 * This helps prevent React hydration errors from timezone differences.
 */

/**
 * Format a date string in Brazilian Portuguese format consistently between server and client
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  // Parse the date, ensuring timezone is handled consistently
  const date = new Date(dateString);
  
  // Force consistent timezone by using UTC methods and adjusting for Brazil timezone (UTC-3)
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ));

  // Format with Intl API in a way that produces consistent output
  const options = { 
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'  // Always use UTC timezone for formatting
  };
  
  return new Intl.DateTimeFormat('pt-BR', options).format(utcDate);
}

/**
 * Simple formatter that removes time component to ensure consistency
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export function formatSimpleDate(dateString) {
  if (!dateString) {
    return '';
  }
  
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}