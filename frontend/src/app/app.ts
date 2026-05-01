import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-layout">
      <app-header />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
    }
    @media (max-width: 768px) {
      .main-content { padding: 1rem; }
    }
  `]
})
export class App {}
