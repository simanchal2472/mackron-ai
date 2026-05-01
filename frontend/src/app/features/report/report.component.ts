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
            <h1 class="page-title">Test Report</h1>
            <p class="page-subtitle">{{ report()!.featureName }} &mdash; {{ report()!.targetUrl }}</p>
          </div>
          <div class="header-actions">
            <a [href]="htmlReportUrl" target="_blank" class="btn btn-secondary">Open HTML Report</a>
            <a routerLink="/test" class="btn btn-primary">New Test</a>
          </div>
        </div>

        <section class="summary-cards grid-5">
          <div class="summary-card total">
            <div class="card-value">{{ report()!.totalScenarios }}</div>
            <div class="card-label">Total</div>
          </div>
          <div class="summary-card pass">
            <div class="card-value">{{ report()!.passedScenarios }}</div>
            <div class="card-label">Passed</div>
          </div>
          <div class="summary-card fail">
            <div class="card-value">{{ report()!.failedScenarios }}</div>
            <div class="card-label">Failed</div>
          </div>
          <div class="summary-card error">
            <div class="card-value">{{ report()!.errorScenarios }}</div>
            <div class="card-label">Errors</div>
          </div>
          <div class="summary-card rate">
            <div class="card-value">{{ report()!.summary.passRate.toFixed(1) }}%</div>
            <div class="card-label">Pass Rate</div>
          </div>
        </section>

        <section class="meta-section">
          <div class="grid-4">
            <div class="meta-item">
              <span class="meta-label">Duration</span>
              <span class="meta-value">{{ formatDuration(report()!.totalDurationMs) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Steps</span>
              <span class="meta-value">{{ report()!.summary.totalSteps }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Passed Steps</span>
              <span class="meta-value">{{ report()!.summary.passedSteps }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Failed Steps</span>
              <span class="meta-value">{{ report()!.summary.failedSteps }}</span>
            </div>
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
          <button class="filter-btn" [class.active]="activeFilter() === 'ALL'" (click)="activeFilter.set('ALL')">All</button>
          <button class="filter-btn" [class.active]="activeFilter() === 'POSITIVE'" (click)="activeFilter.set('POSITIVE')">Positive</button>
          <button class="filter-btn" [class.active]="activeFilter() === 'NEGATIVE'" (click)="activeFilter.set('NEGATIVE')">Negative</button>
          <button class="filter-btn" [class.active]="activeFilter() === 'BOUNDARY'" (click)="activeFilter.set('BOUNDARY')">Boundary</button>
          <button class="filter-btn" [class.active]="activeFilter() === 'EDGE_CASE'" (click)="activeFilter.set('EDGE_CASE')">Edge Case</button>
        </section>

        <section class="scenarios-section">
          @for (scenario of filteredScenarios(); track scenario.id) {
            <div class="scenario-card" [class]="'status-' + scenario.status.toLowerCase()">
              <div class="scenario-header" (click)="toggleScenario(scenario.id)">
                <span class="badge" [class]="'badge-' + scenario.status.toLowerCase()">{{ scenario.status }}</span>
                <h3 class="scenario-name">{{ scenario.name }}</h3>
                <span class="scenario-type-badge" [class]="'type-' + scenario.scenarioType.toLowerCase()">{{ formatType(scenario.scenarioType) }}</span>
                <span class="scenario-duration">{{ formatDuration(scenario.durationMs) }}</span>
                <span class="expand-icon">{{ expandedScenarios().has(scenario.id) ? '&#9660;' : '&#9654;' }}</span>
              </div>
              <p class="scenario-desc">{{ scenario.description }}</p>

              @if (expandedScenarios().has(scenario.id)) {
                <div class="steps-container">
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
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .header-actions { display: flex; gap: 0.75rem; }

    .summary-cards { margin-bottom: 2rem; }
    .summary-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      text-align: center;
      border-top: 3px solid var(--border);
    }
    .summary-card.pass { border-top-color: var(--success); }
    .summary-card.fail { border-top-color: var(--danger); }
    .summary-card.error { border-top-color: var(--warning); }
    .summary-card.rate { border-top-color: var(--accent-primary); }
    .card-value { font-size: 2rem; font-weight: 800; }
    .card-label { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem; }

    .meta-section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .meta-item { text-align: center; }
    .meta-label { display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; }
    .meta-value { display: block; font-weight: 700; font-size: 1.1rem; margin-top: 0.25rem; }

    .critical-section {
      background: var(--danger-bg);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .critical-section h2 { color: #fca5a5; font-size: 1.1rem; margin-bottom: 0.75rem; }
    .critical-item { color: #fca5a5; font-size: 0.9rem; padding: 0.3rem 0; }

    .filter-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }
    .filter-btn:hover:not(.active) { background: var(--bg-tertiary); }

    .scenario-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 0.75rem;
      overflow: hidden;
      border-left: 4px solid var(--border);
    }
    .scenario-card.status-pass { border-left-color: var(--success); }
    .scenario-card.status-fail { border-left-color: var(--danger); }
    .scenario-card.status-error { border-left-color: var(--warning); }
    .scenario-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      cursor: pointer;
      flex-wrap: wrap;
    }
    .scenario-header:hover { background: rgba(255,255,255,0.02); }
    .scenario-name { flex: 1; font-weight: 600; font-size: 0.95rem; }
    .scenario-type-badge {
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .type-positive { background: rgba(34,197,94,0.15); color: var(--success); }
    .type-negative { background: rgba(239,68,68,0.15); color: var(--danger); }
    .type-boundary { background: rgba(245,158,11,0.15); color: var(--warning); }
    .type-edge_case { background: rgba(99,102,241,0.15); color: var(--accent-primary); }
    .scenario-duration { color: var(--text-muted); font-size: 0.85rem; }
    .expand-icon { color: var(--text-muted); font-size: 0.8rem; }
    .scenario-desc { color: var(--text-secondary); font-size: 0.85rem; padding: 0 1.25rem 0.75rem; }

    .steps-container { padding: 0 1rem 1rem; overflow-x: auto; }
    .steps-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .steps-table th {
      background: var(--bg-primary);
      padding: 0.6rem;
      text-align: left;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.8rem;
    }
    .steps-table td { padding: 0.6rem; border-top: 1px solid var(--border); }
    .step-pass td { background: rgba(34,197,94,0.03); }
    .step-fail td { background: rgba(239,68,68,0.03); }
    .step-skip td { opacity: 0.5; }
    code { background: var(--bg-tertiary); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
    .screenshot-cell { text-align: center; padding: 0.75rem !important; }
    .screenshot { max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid var(--border); }

    .error-state {
      text-align: center;
      padding: 3rem;
      background: var(--bg-secondary);
      border-radius: var(--radius);
    }
    .error-state h2 { margin-bottom: 0.5rem; }
    .error-state p { color: var(--text-secondary); margin-bottom: 1.5rem; }
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
