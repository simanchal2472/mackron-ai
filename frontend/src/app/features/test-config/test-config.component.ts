import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TestRequest } from '../../core/models/test-request.model';

@Component({
  selector: 'app-test-config',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-config">
      <div class="config-header">
        <p class="config-eyebrow">Configure</p>
        <h1 class="config-title">New Test</h1>
        <p class="config-desc">Provide the target URL, credentials, and feature to test</p>
      </div>

      <form class="config-form" (ngSubmit)="onSubmit()">

        <div class="form-section">
          <div class="section-header">
            <span class="section-num">01</span>
            <h3>Target Application</h3>
          </div>
          <div class="form-group">
            <label class="form-label" for="url">URL</label>
            <input class="form-input" id="url" type="url"
                   [(ngModel)]="url" name="url"
                   placeholder="https://example.com/login" required />
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-num">02</span>
            <h3>Credentials <span class="optional">(optional)</span></h3>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="username">Username / Email</label>
              <input class="form-input" id="username" type="text"
                     [(ngModel)]="username" name="username"
                     placeholder="testuser&#64;example.com" />
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input class="form-input" id="password" type="password"
                     [(ngModel)]="password" name="password"
                     placeholder="Enter password" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-num">03</span>
            <h3>Feature to Test</h3>
          </div>
          <div class="form-group">
            <label class="form-label" for="feature">Feature Name</label>
            <select class="form-select" id="feature" [(ngModel)]="featureName" name="featureName" required>
              <option value="" disabled>Select a feature...</option>
              <option value="Login">Login</option>
              <option value="Registration Form">Registration / Form</option>
              <option value="CRUD Operations">CRUD Operations</option>
              <option value="Navigation">Navigation</option>
              <option value="Validation">Input Validation</option>
              <option value="Search">Search</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-num">04</span>
            <h3>AI Enhancement <span class="optional">(optional)</span></h3>
          </div>
          <div class="toggle-row">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="llmEnabled" name="llmEnabled" />
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
            </label>
            <span class="toggle-label">Enable LLM-powered test generation</span>
          </div>

          @if (llmEnabled) {
            <div class="llm-config">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="llmProvider">LLM Provider</label>
                  <select class="form-select" id="llmProvider" [(ngModel)]="llmProvider" name="llmProvider">
                    <option value="openai">OpenAI (GPT-4o-mini)</option>
                    <option value="claude">Claude</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="llmApiKey">API Key</label>
                  <input class="form-input" id="llmApiKey" type="password"
                         [(ngModel)]="llmApiKey" name="llmApiKey"
                         placeholder="sk-..." />
                </div>
              </div>
              <p class="hint">Your API key is sent directly to the provider and is not stored.</p>
            </div>
          }
        </div>

        @if (errorMsg()) {
          <div class="error-banner">{{ errorMsg() }}</div>
        }

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg"
                  [disabled]="submitting() || !url || !featureName">
            @if (submitting()) {
              <span class="btn-spinner"></span>
              Running...
            } @else {
              Start Test Execution
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .test-config { max-width: 720px; margin: 0 auto; }

    .config-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .config-eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-primary);
      margin-bottom: 0.5rem;
    }
    .config-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-bottom: 0.5rem;
    }
    .config-desc {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .config-form { display: flex; flex-direction: column; gap: 1px; }

    .form-section {
      background: var(--bg-secondary);
      padding: 2rem;
      transition: background 0.2s ease;
    }
    .form-section:first-of-type { border-radius: var(--radius) var(--radius) 0 0; }
    .form-section:last-of-type { border-radius: 0 0 var(--radius) var(--radius); }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .section-num {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--accent-primary);
      opacity: 0.4;
    }
    .section-header h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .optional {
      color: var(--text-muted);
      font-weight: 400;
      font-size: 0.85rem;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .toggle {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }
    .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
    .toggle-track {
      display: block;
      width: 44px;
      height: 24px;
      background: var(--bg-tertiary);
      border-radius: 24px;
      transition: background 0.3s ease;
      position: relative;
    }
    .toggle-thumb {
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      top: 3px;
      background: var(--text-secondary);
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .toggle input:checked + .toggle-track {
      background: var(--accent-primary);
    }
    .toggle input:checked + .toggle-track .toggle-thumb {
      transform: translateX(20px);
      background: #000;
    }
    .toggle-label { color: var(--text-secondary); font-size: 0.875rem; }

    .llm-config { margin-top: 1.25rem; }
    .hint {
      color: var(--text-muted);
      font-size: 0.75rem;
      margin-top: 0.75rem;
    }

    .error-banner {
      background: var(--danger-bg);
      border: 1px solid rgba(248, 113, 113, 0.15);
      color: var(--danger);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      padding-top: 2rem;
    }
    .btn-lg {
      padding: 1rem 3.5rem;
      font-size: 0.95rem;
    }
    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0,0,0,0.2);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TestConfigComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  url = '';
  username = '';
  password = '';
  featureName = '';
  llmEnabled = false;
  llmProvider = 'openai';
  llmApiKey = '';

  readonly submitting = signal(false);
  readonly errorMsg = signal<string | null>(null);

  onSubmit(): void {
    if (!this.url || !this.featureName) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    const request: TestRequest = {
      url: this.url,
      username: this.username,
      password: this.password,
      featureName: this.featureName,
      llmEnabled: this.llmEnabled,
      llmApiKey: this.llmApiKey,
      llmProvider: this.llmProvider
    };

    this.api.submitTest(request).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/execution', res.testId]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || err.message || 'Failed to start test');
      }
    });
  }
}
