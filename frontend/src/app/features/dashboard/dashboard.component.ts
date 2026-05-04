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
        <div class="hero-glow"></div>
        <div class="hero-content">
          <p class="hero-eyebrow">AI-Powered Testing Agent</p>
          <h1 class="hero-title">
            Test smarter.<br/>
            <span class="gold">Ship confident.</span>
          </h1>
          <p class="hero-desc">
            Automatically generate and execute positive, negative, boundary,
            and edge-case test scenarios for any web application feature.
          </p>
          <a routerLink="/test" class="btn btn-primary hero-cta">Start New Test</a>
        </div>
      </section>

      <section class="how-it-works">
        <h2 class="section-label">How It Works</h2>
        <div class="steps-row">
          <div class="step-card">
            <div class="step-num">01</div>
            <h3>Provide Target</h3>
            <p>Enter the URL, credentials, and feature name you want to test</p>
          </div>
          <div class="step-connector"></div>
          <div class="step-card">
            <div class="step-num">02</div>
            <h3>AI Generates Tests</h3>
            <p>Smart scenarios covering positive, negative, boundary, and edge cases</p>
          </div>
          <div class="step-connector"></div>
          <div class="step-card">
            <div class="step-num">03</div>
            <h3>Automated Execution</h3>
            <p>Playwright runs each test in a real browser with screenshots</p>
          </div>
          <div class="step-connector"></div>
          <div class="step-card">
            <div class="step-num">04</div>
            <h3>Detailed Report</h3>
            <p>Comprehensive report with pass/fail status and recommendations</p>
          </div>
        </div>
      </section>

      @if (history().length > 0) {
        <section class="history">
          <h2 class="section-label">Recent Tests</h2>
          <div class="history-list">
            @for (item of history(); track item.id) {
              <div class="history-row">
                <div class="history-feature">{{ item.featureName }}</div>
                <div class="history-url">{{ item.targetUrl }}</div>
                <div class="history-meta">
                  <span class="history-count">{{ item.totalScenarios }} scenarios</span>
                  <span class="history-rate">{{ item.passRate }}%</span>
                  <span class="badge" [class]="'badge-' + item.status.toLowerCase()">{{ item.status }}</span>
                </div>
                <a [routerLink]="['/report', item.id]" class="history-link">View Report</a>
              </div>
            }
          </div>
        </section>
      }

      <section class="capabilities">
        <h2 class="section-label">Test Capabilities</h2>
        <div class="caps-grid">
          <div class="cap-card">
            <h4>Login Testing</h4>
            <p>Valid credentials, wrong passwords, SQL injection, XSS, empty fields, boundary inputs</p>
          </div>
          <div class="cap-card">
            <h4>Form &amp; Registration</h4>
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
    .dashboard { display: flex; flex-direction: column; gap: 4rem; }

    /* ── Hero ── */
    .hero {
      position: relative;
      text-align: center;
      padding: 6rem 2rem 5rem;
      overflow: hidden;
    }
    .hero-glow {
      position: absolute;
      top: -40%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 400px;
      background: radial-gradient(ellipse, rgba(197, 164, 126, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-eyebrow {
      display: inline-block;
      padding: 0.4rem 1.2rem;
      border: 1px solid var(--border);
      border-radius: 24px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--accent-primary);
      letter-spacing: 0.04em;
      margin-bottom: 2rem;
    }
    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.04em;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }
    .gold {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-desc {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 560px;
      margin: 0 auto 2.5rem;
      line-height: 1.7;
      font-weight: 400;
    }
    .hero-cta {
      padding: 1rem 3rem;
      font-size: 0.95rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
    }

    /* ── How It Works ── */
    .section-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-primary);
      margin-bottom: 1.75rem;
    }
    .steps-row {
      display: flex;
      align-items: stretch;
      gap: 0;
    }
    .step-card {
      flex: 1;
      padding: 2rem 1.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--glass);
      transition: border-color 0.3s ease;
    }
    .step-card:hover {
      border-color: var(--accent-primary);
    }
    .step-connector {
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    .step-connector::after {
      content: '';
      width: 100%;
      height: 1px;
      background: var(--border);
    }
    .step-num {
      font-size: 2rem;
      font-weight: 800;
      color: var(--accent-primary);
      opacity: 0.3;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    .step-card h3 {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    .step-card p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.6;
    }

    /* ── History ── */
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .history-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.15rem 1.5rem;
      background: var(--bg-secondary);
      transition: background 0.2s ease;
    }
    .history-row:hover {
      background: var(--bg-tertiary);
    }
    .history-feature {
      font-weight: 600;
      font-size: 0.9rem;
      min-width: 140px;
    }
    .history-url {
      flex: 1;
      color: var(--text-muted);
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .history-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8rem;
    }
    .history-count { color: var(--text-secondary); }
    .history-rate { color: var(--accent-primary); font-weight: 600; }
    .history-link {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--accent-primary);
      white-space: nowrap;
      transition: opacity 0.2s;
    }
    .history-link:hover { opacity: 0.7; }

    /* ── Capabilities ── */
    .caps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .cap-card {
      padding: 1.75rem;
      background: var(--bg-secondary);
      transition: background 0.2s ease;
    }
    .cap-card:hover {
      background: var(--bg-tertiary);
    }
    .cap-card h4 {
      color: var(--accent-primary);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }
    .cap-card p {
      color: var(--text-secondary);
      font-size: 0.825rem;
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .steps-row { flex-direction: column; gap: 0.75rem; }
      .step-connector { width: auto; height: 20px; }
      .step-connector::after { width: 1px; height: 100%; }
      .caps-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero { padding: 3rem 1rem 2.5rem; }
      .hero-title { font-size: 2.5rem; }
      .history-row { flex-wrap: wrap; gap: 0.75rem; }
      .history-url { min-width: 100%; order: 4; }
    }
    @media (max-width: 480px) {
      .caps-grid { grid-template-columns: 1fr; }
      .hero-title { font-size: 2rem; }
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
