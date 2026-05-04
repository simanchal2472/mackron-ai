import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TestReport, TestScenario, ScenarioType } from '../../core/models/test-report.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [LoadingSpinnerComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="report-page">
      @if (loading()) {
        <app-loading-spinner message="Loading report..." />
      } @else if (error()) {
        <div class="error-state">
          <h2>Report Not Available</h2>
          <p>{{ error() }}</p>
          <a routerLink="/" class="btn btn-primary">Back to Dashboard</a>
        </div>
      } @else if (report()) {

        <div class="report-header">
          <div>
            <p class="report-eyebrow">Report</p>
            <h1 class="report-title">{{ report()!.featureName }}</h1>
            <p class="report-url">{{ report()!.targetUrl }}</p>
          </div>
          <div class="header-actions">
            <a [href]="htmlReportUrl" target="_blank" class="btn btn-secondary">HTML Report</a>
            <a routerLink="/test" class="btn btn-primary">New Test</a>
          </div>
        </div>

        <section class="summary-row">
          <div class="summary-card">
            <div class="card-value">{{ report()!.totalScenarios }}</div>
            <div class="card-label">Total</div>
          </div>
          <div class="summary-card card-pass">
            <div class="card-value">{{ report()!.passedScenarios }}</div>
            <div class="card-label">Passed</div>
          </div>
          <div class="summary-card card-fail">
            <div class="card-value">{{ report()!.failedScenarios }}</div>
            <div class="card-label">Failed</div>
          </div>
          <div class="summary-card card-error">
            <div class="card-value">{{ report()!.errorScenarios }}</div>
            <div class="card-label">Errors</div>
          </div>
          <div class="summary-card card-rate">
            <div class="card-value">{{ report()!.summary.passRate.toFixed(1) }}<span class="card-unit">%</span></div>
            <div class="card-label">Pass Rate</div>
          </div>
        </section>

        <section class="meta-strip">
          <div class="meta-item">
            <span class="meta-label">Duration</span>
            <span class="meta-value">{{ formatDuration(report()!.totalDurationMs) }}</span>
          </div>
          <div class="meta-sep"></div>
          <div class="meta-item">
            <span class="meta-label">Total Steps</span>
            <span class="meta-value">{{ report()!.summary.totalSteps }}</span>
          </div>
          <div class="meta-sep"></div>
          <div class="meta-item">
            <span class="meta-label">Passed Steps</span>
            <span class="meta-value">{{ report()!.summary.passedSteps }}</span>
          </div>
          <div class="meta-sep"></div>
          <div class="meta-item">
            <span class="meta-label">Failed Steps</span>
            <span class="meta-value">{{ report()!.summary.failedSteps }}</span>
          </div>
        </section>

        @if (report()!.summary.criticalFailures.length > 0) {
          <section class="critical-section">
            <h2>Critical Failures</h2>
            <div class="critical-list">
              @for (failure of report()!.summary.criticalFailures; track $index) {
                <div class="critical-item">{{ failure }}</div>
              }
            </div>
          </section>
        }

        <section class="filter-bar">
          <button class="filter-pill" [class.active]="activeFilter() === 'ALL'" (click)="activeFilter.set('ALL')">All</button>
          <button class="filter-pill" [class.active]="activeFilter() === 'POSITIVE'" (click)="activeFilter.set('POSITIVE')">Positive</button>
          <button class="filter-pill" [class.active]="activeFilter() === 'NEGATIVE'" (click)="activeFilter.set('NEGATIVE')">Negative</button>
          <button class="filter-pill" [class.active]="activeFilter() === 'BOUNDARY'" (click)="activeFilter.set('BOUNDARY')">Boundary</button>
          <button class="filter-pill" [class.active]="activeFilter() === 'EDGE_CASE'" (click)="activeFilter.set('EDGE_CASE')">Edge Case</button>
        </section>

        <section class="scenarios-section">
          @for (scenario of filteredScenarios(); track scenario.id) {
            <div class="scenario-card" [class]="'sc-' + scenario.status.toLowerCase()">
              <div class="scenario-header" (click)="toggleScenario(scenario.id)">
                <span class="badge" [class]="'badge-' + scenario.status.toLowerCase()">{{ scenario.status }}</span>
                <h3 class="scenario-name">{{ scenario.name }}</h3>
                <span class="scenario-type-tag" [class]="'tag-' + scenario.scenarioType.toLowerCase()">{{ formatType(scenario.scenarioType) }}</span>
                <span class="scenario-dur">{{ formatDuration(scenario.durationMs) }}</span>
                <span class="expand-chevron" [class.open]="expandedScenarios().has(scenario.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <p class="scenario-desc">{{ scenario.description }}</p>

              @if (expandedScenarios().has(scenario.id)) {
                <div class="steps-wrap">
                  <table class="steps-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Expected</th>
                        <th>Actual</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (step of scenario.steps; track step.stepNumber) {
                        <tr [class]="'step-' + step.status.toLowerCase()">
                          <td>{{ step.stepNumber }}</td>
                          <td><code>{{ step.action }}</code></td>
                          <td>{{ step.description }}</td>
                          <td>{{ step.expectedResult }}</td>
                          <td>{{ step.actualResult || '-' }}</td>
                          <td><span class="badge" [class]="'badge-' + step.status.toLowerCase()">{{ step.status }}</span></td>
                          <td>{{ step.durationMs }}ms</td>
                        </tr>
                        @if (step.screenshotBase64) {
                          <tr>
                            <td colspan="7" class="screenshot-cell">
                              <img [src]="'data:image/png;base64,' + step.screenshotBase64"
                                   [alt]="'Screenshot step ' + step.stepNumber" class="screenshot" />
                            </td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        </section>

      }
    </div>
  `,
  styles: [`
    .report-page { max-width: 1100px; margin: 0 auto; }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .report-eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-primary);
      margin-bottom: 0.35rem;
    }
    .report-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.25rem;
    }
    .report-url {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .header-actions { display: flex; gap: 0.75rem; }

    /* ── Summary Cards ── */
    .summary-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1px;
      background: var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: var(--bg-secondary);
      padding: 1.5rem;
      text-align: center;
    }
    .card-value {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .card-unit { font-size: 1.25rem; opacity: 0.6; }
    .card-label {
      color: var(--text-muted);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 0.5rem;
      font-weight: 500;
    }
    .card-pass .card-value { color: var(--success); }
    .card-fail .card-value { color: var(--danger); }
    .card-error .card-value { color: var(--warning); }
    .card-rate .card-value { color: var(--accent-primary); }

    /* ── Meta Strip ── */
    .meta-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 1.25rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 2rem;
    }
    .meta-item { text-align: center; }
    .meta-label {
      display: block;
      color: var(--text-muted);
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 500;
    }
    .meta-value {
      display: block;
      font-weight: 700;
      font-size: 1rem;
      margin-top: 0.2rem;
    }
    .meta-sep {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    /* ── Critical ── */
    .critical-section {
      background: var(--danger-bg);
      border: 1px solid rgba(248, 113, 113, 0.12);
      border-radius: var(--radius-sm);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
    }
    .critical-section h2 {
      color: var(--danger);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }
    .critical-item { color: var(--danger); font-size: 0.85rem; padding: 0.25rem 0; opacity: 0.85; }

    /* ── Filter Pills ── */
    .filter-bar {
      display: flex;
      gap: 0.35rem;
      margin-bottom: 1.5rem;
    }
    .filter-pill {
      padding: 0.45rem 1rem;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-pill.active {
      background: var(--accent-primary);
      color: #000;
      border-color: var(--accent-primary);
      font-weight: 600;
    }
    .filter-pill:hover:not(.active) {
      border-color: var(--text-muted);
      color: var(--text-secondary);
    }

    /* ── Scenario Cards ── */
    .scenario-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 0.5rem;
      overflow: hidden;
      border-left: 3px solid var(--border);
      transition: border-color 0.2s ease;
    }
    .scenario-card.sc-pass { border-left-color: var(--success); }
    .scenario-card.sc-fail { border-left-color: var(--danger); }
    .scenario-card.sc-error { border-left-color: var(--warning); }
    .scenario-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .scenario-header:hover { background: rgba(255,255,255,0.015); }
    .scenario-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
    .scenario-type-tag {
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tag-positive { background: var(--success-bg); color: var(--success); }
    .tag-negative { background: var(--danger-bg); color: var(--danger); }
    .tag-boundary { background: var(--warning-bg); color: var(--warning); }
    .tag-edge_case { background: rgba(96,165,250,0.1); color: var(--info); }
    .scenario-dur { color: var(--text-muted); font-size: 0.8rem; }
    .expand-chevron {
      color: var(--text-muted);
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
    }
    .expand-chevron.open { transform: rotate(180deg); }
    .scenario-desc {
      color: var(--text-secondary);
      font-size: 0.8rem;
      padding: 0 1.25rem 0.75rem;
      line-height: 1.5;
    }

    /* ── Steps Table ── */
    .steps-wrap { padding: 0 1rem 1rem; overflow-x: auto; }
    .steps-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .steps-table th {
      background: rgba(255,255,255,0.02);
      padding: 0.6rem 0.75rem;
      text-align: left;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .steps-table td {
      padding: 0.6rem 0.75rem;
      border-top: 1px solid var(--border);
    }
    .step-pass td { background: rgba(52, 211, 153, 0.02); }
    .step-fail td { background: rgba(248, 113, 113, 0.02); }
    .step-skip td { opacity: 0.4; }
    code {
      background: rgba(255,255,255,0.04);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    .screenshot-cell { text-align: center; padding: 0.75rem !important; }
    .screenshot {
      max-width: 100%;
      max-height: 250px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }

    /* ── Error State ── */
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
    }
    .error-state h2 { margin-bottom: 0.5rem; }
    .error-state p { color: var(--text-secondary); margin-bottom: 1.5rem; }

    @media (max-width: 768px) {
      .summary-row { grid-template-columns: repeat(3, 1fr); }
      .meta-strip { flex-wrap: wrap; gap: 1rem; }
      .meta-sep { display: none; }
      .filter-bar { flex-wrap: wrap; }
    }
    @media (max-width: 480px) {
      .summary-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly report = signal<TestReport | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeFilter = signal<string>('ALL');
  readonly expandedScenarios = signal<Set<string>>(new Set());

  htmlReportUrl = '';

  readonly filteredScenarios = computed(() => {
    const r = this.report();
    if (!r) return [];
    const filter = this.activeFilter();
    if (filter === 'ALL') return r.scenarios;
    return r.scenarios.filter(s => s.scenarioType === filter);
  });

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('testId') || '';
    if (!testId) {
      this.router.navigate(['/']);
      return;
    }
    this.htmlReportUrl = this.api.getHtmlReportUrl(testId);
    this.api.getReport(testId).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load report');
        this.loading.set(false);
      }
    });
  }

  toggleScenario(id: string): void {
    this.expandedScenarios.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return Math.floor(ms / 60000) + 'm ' + Math.floor((ms % 60000) / 1000) + 's';
  }

  formatType(type: ScenarioType): string {
    return type.replace('_', ' ');
  }
}
