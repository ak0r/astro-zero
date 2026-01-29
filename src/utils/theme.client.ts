/**
 * Client-side Theme Service
 *
 * Unified theme management for static sites.
 * Handles theme persistence, system preference detection, and UI state.
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

class ThemeService {
  private darkTheme: string = 'dark';
  private lightTheme: string = 'light';
  private defaultTheme: string = 'auto';
  private listeners: Set<(mode: ThemeMode) => void> = new Set();
  private initialized: boolean = false;

  /**
   * Initialize the service with page-level theme configuration
   */
  init(): void {
    if (this.initialized) return;

    // Read theme config from document attributes
    const root = document.documentElement;
    this.darkTheme = root.getAttribute('data-dark-theme') || 'dark';
    this.lightTheme = root.getAttribute('data-light-theme') || 'light';
    this.defaultTheme = root.getAttribute('data-theme') || 'auto';

    // Apply stored theme or default
    const stored = this.getStoredMode();
    if (!stored) {
      this.setTheme(this.defaultTheme as ThemeMode);
    } else {
      this.applyTheme(stored);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getStoredMode() === 'auto') {
        this.applySystemTheme();
      }
    });

    this.initialized = true;
  }

  /**
   * Get the stored theme mode from localStorage
   */
  getStoredMode(): ThemeMode | null {
    const stored = localStorage.getItem('data-theme');
    if (!stored) return null;
    if (stored === 'auto' || stored === 'system') return 'auto';
    if (stored === this.darkTheme) return 'dark';
    return 'light';
  }

  /**
   * Get the currently applied theme (what's visible)
   */
  getAppliedTheme(): string {
    return document.documentElement.getAttribute('data-theme') || this.lightTheme;
  }

  /**
   * Apply system preference theme
   */
  private applySystemTheme(): string {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? this.darkTheme : this.lightTheme;
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }

  /**
   * Apply a specific theme mode
   */
  private applyTheme(mode: ThemeMode): void {
    if (mode === 'auto') {
      this.applySystemTheme();
    } else if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', this.darkTheme);
    } else {
      document.documentElement.setAttribute('data-theme', this.lightTheme);
    }
  }

  /**
   * Set theme mode and persist to localStorage
   */
  setTheme(mode: ThemeMode): void {
    // Persist to localStorage
    if (mode === 'auto') {
      localStorage.setItem('data-theme', 'auto');
    } else if (mode === 'dark') {
      localStorage.setItem('data-theme', this.darkTheme);
    } else {
      localStorage.setItem('data-theme', this.lightTheme);
    }

    // Apply theme
    this.applyTheme(mode);

    // Notify listeners
    this.notifyListeners(mode);
  }

  /**
   * Cycle through themes: light → dark → auto → light
   */
  cycleTheme(): ThemeMode {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentMode = this.getStoredMode() || 'light';
    const currentIndex = themeOrder.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextMode = themeOrder[nextIndex];

    this.setTheme(nextMode);
    return nextMode;
  }

  /**
   * Subscribe to theme changes
   * Returns unsubscribe function
   */
  subscribe(callback: (mode: ThemeMode) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(mode: ThemeMode): void {
    this.listeners.forEach(callback => callback(mode));
  }
}

// Singleton instance
export const themeService = new ThemeService();
