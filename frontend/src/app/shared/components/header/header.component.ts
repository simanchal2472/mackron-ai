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
          <span class="logo-mark">M</span>
          <span class="logo-text">mackron<span class="logo-accent">ai</span></span>
        </a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Dashboard</a>
          <a routerLink="/test" routerLinkActive="active" class="nav-link">New Test</a>
        </nav>
        <button class="theme-toggle" (click)="themeService.toggleTheme()" [attr.aria-label]="'Toggle theme'">
          @if (themeService.currentTheme() === 'dark') {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid var(--border);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: var(--text-primary);
    }
    .logo-mark {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-gradient);
      color: #000;
      border-radius: 10px;
      font-weight: 800;
      font-size: 1rem;
    }
    .logo-text {
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.03em;
    }
    .logo-accent {
      color: var(--accent-primary);
    }
    .nav {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }
    .nav-link {
      text-decoration: none;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-xs);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      letter-spacing: 0.01em;
    }
    .nav-link:hover {
      color: var(--text-primary);
    }
    .nav-link.active {
      color: var(--accent-primary);
    }
    .theme-toggle {
      background: transparent;
      border: 1px solid var(--border);
      width: 38px;
      height: 38px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.3s ease;
    }
    .theme-toggle:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    @media (max-width: 768px) {
      .header-inner { padding: 0 1rem; gap: 1rem; }
      .logo-text { display: none; }
    }
  `]
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
}
