import crypto from 'crypto';

/**
 * Generate a hash for theme settings to use for cache busting in localStorage
 */
export function generateThemeHash(
  featureButton: string,
  defaultTheme: string,
  lightTheme: string,
  darkTheme: string
): string {
  return crypto
    .createHash('md5')
    .update(featureButton + defaultTheme + lightTheme + darkTheme)
    .digest('hex')
    .slice(0, 8); // Truncate to first 8 characters
}

/**
 * Get theme from localStorage or system preference
 */
export function getStoredTheme(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('data-theme');
}

/**
 * Set theme in localStorage and on document
 */
export function setTheme(theme: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('data-theme', theme);
  }
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Get system color scheme preference
 */
export function getSystemTheme(darkTheme: string, lightTheme: string): string {
  if (typeof window === 'undefined') return lightTheme;
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? darkTheme : lightTheme;
}