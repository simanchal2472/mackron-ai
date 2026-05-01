import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TestHistoryItem } from '../../core/models/test-report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">AI-Powered Testing</div>
          <h1 class="hero-title">
            <span class="gradient-text">Mackron AI</span>
          </h1>
          <p class="hero-subtitle">
            Web Application Testing Agent that automatically generates and executes
            positive, negative, boundary, and edge-case test scenarios for any web feature.
          </p>
          <div class="hero-actions">
            <a routerLink="/test" class="btn btn-primary btn-lg">Start New Test</a>
          </div>
        </div>
      </section>

      <section class="features">
        <h2 class="section-title">How It Works</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">1</div>
            <h3>Provide Target</h3>
            <p>Enter the URL, credentials, and feature name you want to test</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">2</div>
            <h3>AI Generates Tests</h3>
            <p>Smart test scenarios are generated covering positive, negative, boundary, and edge cases</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">3</div>
            <h3>Automated Execution</h3>
            <p>Playwright runs each test in a real browser with screenshots and timing</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">4</div>
            <h3>Detailed Report</h3>
            <p>Get a comprehensive report with pass/fail status, screenshots, and recommendations</p>
          </div>
        </div>
      </section>

      @if (history().length > 0) {
        <section class="history">
          <h2 class="section-title">Recent Tests</h2>
          <div class="history-table-wrap">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Target URL</th>
                  <th>Scenarios</th>
                  <th>Pass Rate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history(); track item.id) {
                  <tr>
                    <td class="feature-name">{{ item.featureName }}</td>
                    <td class="url-cell">{{ item.targetUrl }}</td>
                    <td>{{ item.totalScenarios }}</td>
                    <td>{{ item.passRate }}%</td>
                    <td>
                      <span class="badge" [class]="'badge-' + item.status.toLowerCase()">
                        {{ item.status }}
                      </span>
                    </td>
                    <td><a [routerLink]="['/report', item.id]" class="view-link">View Report</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      <section class="capabilities">
        <h2 class="section-title">Test Capabilities</h2>
        <div class="caps-grid">
          <div class="cap-card">
            <h4>Login Testing</h4>
            <p>Valid credentials, wrong passwords, SQL injection, XSS, empty fields, boundary inputs</p>
          </div>
          <div class="cap-card">
            <h4>Form & Registration</h4>
            <p>Required fields, email validation, phone format, max length, special characters</p>
          </div>
          <div class="cap-card">
            <h4>CRUD Operations</h4>
            <p>Create, read, update, delete with valid and invalid data, empty states</p>
          </div>
          <div class="cap-card">
            <h4>Navigation</h4>
            <p>Broken links, 404 handling, back/forward, page load performance</p>
          </div>
          <div class="cap-card">
            <h4>Input Validation</h4>
            <p>Inline errors, blur validation, min/max boundaries, paste handling</p>
          </div>
          <div class="cap-card">
            <h4>Search</h4>
            <p>Valid queries, empty search, no results, special character handling</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 3rem; }
    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-secondary);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .hero-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(99,102,241,0.15);
      color: var(--accent-primary);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .hero-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; }
    .gradient-text {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      color: var(--text-secondary);
      font-size: 1.15rem;
      max-width: 640px;
      margin: 0 auto 2rem;
      line-height: 1.7;
    }
    .btn-lg { padding: 1rem 2.5rem; font-size: 1.05rem; border-radius: var(--radius); }
    .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .feature-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      text-align: center;
    }
    .feature-icon {
      width: 48px; height: 48px;
      margin: 0 auto 1rem;
      display: flex; align-items: center; justify-content: center;
      background: var(--accent-gradient);
      color: white;
      border-radius: 50%;
      font-weight: 800;
      font-size: 1.2rem;
    }
    .feature-card h3 { font-size: 1.05rem; margin-bottom: 0.5rem; }
    .feature-card p { color: var(--text-secondary); font-size: 0.9rem; }

    .history-table-wrap { overflow-x: auto; }
    .history-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-secondary);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .history-table th {
      background: var(--bg-tertiary);
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .history-table td {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border);
      font-size: 0.9rem;
    }
    .url-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .feature-name { font-weight: 600; }
    .view-link { color: var(--accent-primary); font-weight: 500; }

    .caps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .cap-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
    }
    .cap-card h4 { color: var(--accent-primary); margin-bottom: 0.5rem; }
    .cap-card p { color: var(--text-secondary); font-size: 0.9rem; }

    @media (max-width: 768px) {
      .hero { padding: 2rem 1rem; }
      .hero-title { font-size: 2.2rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly history = signal<TestHistoryItem[]>([]);

  ngOnInit(): void {
    this.api.getHistory().subscribe(items => this.history.set(items));
  }
}
