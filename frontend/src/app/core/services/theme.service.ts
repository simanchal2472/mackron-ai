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
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--bg-tertiary': '#334155',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--accent-primary': '#6366f1',
      '--accent-secondary': '#8b5cf6',
      '--accent-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      '--success': '#22c55e',
      '--success-bg': '#166534',
      '--danger': '#ef4444',
      '--danger-bg': '#7f1d1d',
      '--warning': '#f59e0b',
      '--warning-bg': '#78350f',
      '--info': '#3b82f6',
      '--border': '#334155',
      '--shadow': '0 4px 6px -1px rgba(0,0,0,0.3)',
      '--radius': '12px',
      '--radius-sm': '8px'
    }
  };

  private readonly lightTheme: ThemeConfig = {
    name: 'light',
    variables: {
      '--bg-primary': '#f8fafc',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e2e8f0',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#94a3b8',
      '--accent-primary': '#6366f1',
      '--accent-secondary': '#8b5cf6',
      '--accent-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      '--success': '#16a34a',
      '--success-bg': '#dcfce7',
      '--danger': '#dc2626',
      '--danger-bg': '#fee2e2',
      '--warning': '#d97706',
      '--warning-bg': '#fef3c7',
      '--info': '#2563eb',
      '--border': '#e2e8f0',
      '--shadow': '0 4px 6px -1px rgba(0,0,0,0.1)',
      '--radius': '12px',
      '--radius-sm': '8px'
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
