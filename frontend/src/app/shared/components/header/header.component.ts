import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <div class="header-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">M</span>
          <span class="logo-text">Mackron AI</span>
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Dashboard</a>
          <a routerLink="/test" routerLinkActive="active" class="nav-link">New Test</a>
        </nav>
        <button class="theme-toggle" (click)="themeService.toggleTheme()" [attr.aria-label]="'Toggle theme'">
          {{ themeService.currentTheme() === 'dark' ? '☀' : '☾' }}
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 700;
      font-size: 1.25rem;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      color: white;
      border-radius: 8px;
      font-weight: 800;
      font-size: 1.1rem;
    }
    .nav {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }
    .nav-link {
      text-decoration: none;
      color: var(--text-secondary);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .nav-link:hover { color: var(--text-primary); background: var(--bg-tertiary); }
    .nav-link.active { color: var(--accent-primary); background: rgba(99,102,241,0.1); }
    .theme-toggle {
      background: var(--bg-tertiary);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .theme-toggle:hover { transform: scale(1.1); }
    @media (max-width: 768px) {
      .header-inner { padding: 0.75rem 1rem; gap: 1rem; }
      .logo-text { display: none; }
    }
  `]
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
}
