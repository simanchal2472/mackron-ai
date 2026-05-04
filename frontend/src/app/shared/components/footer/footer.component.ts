import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">mackron<span class="accent">ai</span></span>
        <span class="footer-sep"></span>
        <span class="footer-copy">Web Application Testing Agent</span>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      padding: 2rem;
      border-top: 1px solid var(--border);
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .footer-brand {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-secondary);
      letter-spacing: -0.02em;
    }
    .accent {
      color: var(--accent-primary);
    }
    .footer-sep {
      width: 1px;
      height: 14px;
      background: var(--border);
    }
    .footer-copy {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 400;
    }
  `]
})
export class FooterComponent {}
