import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <p>Powered by <strong>Mackron AI</strong> &mdash; Web Application Testing Agent</p>
    </footer>
  `,
  styles: [`
    .footer {
      text-align: center;
      padding: 1.5rem 2rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      font-size: 0.85rem;
    }
    strong { color: var(--accent-primary); }
  `]
})
export class FooterComponent {}
