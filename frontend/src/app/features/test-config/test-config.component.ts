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
      <h1 class="page-title">Configure Test</h1>
      <p class="page-subtitle">Provide the target URL, credentials, and feature to test</p>

      <form class="config-form" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3 class="section-label">Target Application</h3>
          <div class="form-group">
            <label class="form-label" for="url">URL *</label>
            <input class="form-input" id="url" type="url"
                   [(ngModel)]="url" name="url"
                   placeholder="https://example.com/login" required />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-label">Credentials (Optional)</h3>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="username">Username / Email</label>
              <input class="form-input" id="username" type="text"
                     [(ngModel)]="username" name="username"
                     placeholder="testuser@example.com" />
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
          <h3 class="section-label">Feature to Test *</h3>
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
          <h3 class="section-label">AI Enhancement (Optional)</h3>
          <div class="toggle-row">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="llmEnabled" name="llmEnabled" />
              <span class="toggle-slider"></span>
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
    .config-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
    }
    .section-label {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--accent-primary);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: var(--bg-tertiary);
      border-radius: 24px;
      transition: 0.3s;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    .toggle input:checked + .toggle-slider { background: var(--accent-primary); }
    .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }
    .toggle-label { color: var(--text-secondary); font-size: 0.9rem; }
    .llm-config { margin-top: 1rem; }
    .hint { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem; }
    .error-banner {
      background: var(--danger-bg);
      color: #fca5a5;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
    }
    .form-actions { display: flex; justify-content: center; padding-top: 1rem; }
    .btn-lg { padding: 1rem 3rem; font-size: 1.05rem; }
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
