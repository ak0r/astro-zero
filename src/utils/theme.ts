/**
 * Theme Utilities
 *
 * Server-side theme configuration helpers.
 * For client-side theme management, use theme.client.ts
 */

/**
 * Get default theme configuration
 */
export function getThemeConfig() {
  return {
    defaultTheme: 'auto',
    lightTheme: 'light',
    darkTheme: 'dark',
  };
}

// Re-export client-side types for convenience
export type { ThemeMode } from './theme.client';
