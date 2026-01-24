/**
 * Safe localStorage utilities with proper error handling
 * Prevents application crashes from corrupted or malicious localStorage data
 */

/**
 * Safely parse JSON from localStorage with fallback value
 * @param key - localStorage key
 * @param defaultValue - Value to return if parsing fails or key doesn't exist
 * @returns Parsed value or default
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely parse JSON string with fallback value
 * @param value - JSON string to parse
 * @param defaultValue - Value to return if parsing fails
 * @returns Parsed value or default
 */
export function safeJsonParse<T>(value: string | null, defaultValue: T): T {
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringify and save to localStorage
 * @param key - localStorage key
 * @param value - Value to save
 * @returns true if successful, false otherwise
 */
export function safeSaveItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Get raw string from localStorage (no parsing)
 * @param key - localStorage key
 * @param defaultValue - Value to return if key doesn't exist
 * @returns Raw string value or default
 */
export function safeGetString(key: string, defaultValue: string = ""): string {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    return defaultValue;
  }
}
