import { Injectable, signal, effect } from '@angular/core';

interface ThemeConfig {
  readonly name: string;
  readonly variables: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly currentThemeState = signal<'dark' | 'light'>('dark');
  readonly currentTheme = this.currentThemeState.asReadonly();

  private readonly darkTheme: ThemeConfig = {
    name: 'dark',
    variables: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--bg-tertiary': '#1a1a1a',
      '--bg-elevated': '#111111',
      '--text-primary': '#e8e8e8',
      '--text-secondary': '#888888',
      '--text-muted': '#555555',
      '--accent-primary': '#c5a47e',
      '--accent-secondary': '#d4b896',
      '--accent-gradient': 'linear-gradient(135deg, #c5a47e, #d4b896)',
      '--success': '#34d399',
      '--success-bg': 'rgba(52, 211, 153, 0.1)',
      '--danger': '#f87171',
      '--danger-bg': 'rgba(248, 113, 113, 0.08)',
      '--warning': '#fbbf24',
      '--warning-bg': 'rgba(251, 191, 36, 0.08)',
      '--info': '#60a5fa',
      '--border': 'rgba(255, 255, 255, 0.06)',
      '--border-subtle': 'rgba(255, 255, 255, 0.03)',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.4)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
      '--radius': '16px',
      '--radius-sm': '10px',
      '--radius-xs': '6px',
      '--glass': 'rgba(255, 255, 255, 0.02)',
      '--glass-border': 'rgba(255, 255, 255, 0.05)'
    }
  };

  private readonly lightTheme: ThemeConfig = {
    name: 'light',
    variables: {
      '--bg-primary': '#faf8f5',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f0ebe4',
      '--bg-elevated': '#fff9f2',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#6b6b6b',
      '--text-muted': '#9a9a9a',
      '--accent-primary': '#9a7b5b',
      '--accent-secondary': '#b8956e',
      '--accent-gradient': 'linear-gradient(135deg, #9a7b5b, #b8956e)',
      '--success': '#16a34a',
      '--success-bg': 'rgba(22, 163, 74, 0.08)',
      '--danger': '#dc2626',
      '--danger-bg': 'rgba(220, 38, 38, 0.06)',
      '--warning': '#d97706',
      '--warning-bg': 'rgba(217, 119, 6, 0.06)',
      '--info': '#2563eb',
      '--border': 'rgba(0, 0, 0, 0.06)',
      '--border-subtle': 'rgba(0, 0, 0, 0.03)',
      '--shadow': '0 8px 32px rgba(0, 0, 0, 0.08)',
      '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
      '--radius': '16px',
      '--radius-sm': '10px',
      '--radius-xs': '6px',
      '--glass': 'rgba(0, 0, 0, 0.02)',
      '--glass-border': 'rgba(0, 0, 0, 0.05)'
    }
  };

  constructor() {
    effect(() => {
      const theme = this.currentThemeState();
      this.applyTheme(theme === 'dark' ? this.darkTheme : this.lightTheme);
    });
  }

  toggleTheme(): void {
    this.currentThemeState.update(t => t === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(config: ThemeConfig): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', config.name);
    for (const [key, value] of Object.entries(config.variables)) {
      root.style.setProperty(key, value);
    }
  }
}
