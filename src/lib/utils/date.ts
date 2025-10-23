import { formatDistanceToNow } from 'date-fns';

/**
 * Format a date string to show the relative time distance from now
 * @param dateString - The date string to format
 * @returns A string representing the relative time distance
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date string to a standard date format
 * @param dateString - The date string to format
 * @param options - Optional formatting options
 * @returns A formatted date string
 */
export function formatDate(
  dateString: string,
  options: {
    locale?: string;
    includeTime?: boolean;
  } = {}
): string {
  const date = new Date(dateString);
  const { locale = 'en-US', includeTime = false } = options;
  
  if (includeTime) {
    return date.toLocaleString(locale);
  }
  
  return date.toLocaleDateString(locale);
}

/**
 * Check if a date is in the past
 * @param dateString - The date string to check
 * @returns True if the date is in the past
 */
export function isPast(dateString: string): boolean {
  const date = new Date(dateString);
  return date < new Date();
}

/**
 * Check if a date is within a certain number of days from now
 * @param dateString - The date string to check
 * @param days - The number of days to check against
 * @returns True if the date is within the specified number of days
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}
