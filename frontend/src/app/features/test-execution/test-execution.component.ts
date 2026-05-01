import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import {
  SseStatusEvent,
  SseScenariosGeneratedEvent,
  SseScenarioStartEvent,
  SseStepUpdateEvent,
  SseScenarioCompleteEvent,
  SseCompletedEvent
} from '../../core/models/sse-events.model';

interface ScenarioProgress {
  readonly index: number;
  readonly name: string;
  readonly type: string;
  readonly totalSteps: number;
  completedSteps: number;
  status: string;
  durationMs: number;
}

interface LogEntry {
  readonly time: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'error' | 'step';
}

@Component({
  selector: 'app-test-execution',
  standalone: true,
  imports: [LoadingSpinnerComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="execution-page">
      <h1 class="page-title">Test Execution</h1>
      <p class="page-subtitle">Test ID: {{ testId }}</p>

      <div class="status-banner" [class]="'status-' + phase()">
        <div class="status-indicator"></div>
        <span>{{ statusMessage() }}</span>
      </div>

      @if (totalScenarios() > 0) {
        <section class="progress-section">
          <h2>Progress</h2>
          <div class="progress-bar-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="overallProgress()"></div>
            </div>
            <span class="progress-text">{{ completedCount() }} / {{ totalScenarios() }} scenarios</span>
          </div>

          <div class="scenarios-list">
            @for (s of scenarios(); track s.index) {
              <div class="scenario-row" [class]="'row-' + s.status.toLowerCase()">
                <div class="scenario-status-icon">
                  @switch (s.status) {
                    @case ('PASS') { <span class="icon pass">&#10004;</span> }
                    @case ('FAIL') { <span class="icon fail">&#10008;</span> }
                    @case ('ERROR') { <span class="icon error">!</span> }
                    @case ('RUNNING') { <span class="icon running">&#9654;</span> }
                    @default { <span class="icon pending">&#8226;</span> }
                  }
                </div>
                <div class="scenario-info">
                  <span class="scenario-name">{{ s.name }}</span>
                  <span class="scenario-type badge" [class]="'badge-' + s.type.toLowerCase()">{{ s.type }}</span>
                </div>
                <div class="scenario-steps">{{ s.completedSteps }}/{{ s.totalSteps }} steps</div>
                @if (s.durationMs > 0) {
                  <div class="scenario-duration">{{ formatDuration(s.durationMs) }}</div>
                }
              </div>
            }
          </div>
        </section>
      }

      <section class="log-section">
        <h2>Live Log</h2>
        <div class="log-container">
          @for (entry of logEntries(); track $index) {
            <div class="log-entry" [class]="'log-' + entry.type">
              <span class="log-time">{{ entry.time }}</span>
              <span class="log-msg">{{ entry.message }}</span>
            </div>
          }
          @if (phase() === 'running' || phase() === 'generating') {
            <app-loading-spinner [message]="'Executing...'" />
          }
        </div>
      </section>

      @if (phase() === 'completed' || phase() === 'error') {
        <div class="actions">
          <a [routerLink]="['/report', testId]" class="btn btn-primary">View Full Report</a>
          <a routerLink="/test" class="btn btn-secondary">Run Another Test</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .execution-page { max-width: 900px; margin: 0 auto; }
    .status-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
      font-weight: 600;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
    }
    .status-indicator {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .status-generating .status-indicator { background: var(--info); animation: pulse 1.5s infinite; }
    .status-running .status-indicator { background: var(--warning); animation: pulse 1s infinite; }
    .status-completed .status-indicator { background: var(--success); }
    .status-error .status-indicator { background: var(--danger); }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    .progress-section { margin-bottom: 2rem; }
    .progress-section h2, .log-section h2 { font-size: 1.2rem; margin-bottom: 1rem; }
    .progress-bar-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent-gradient);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .progress-text { color: var(--text-secondary); font-size: 0.9rem; white-space: nowrap; }

    .scenarios-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .scenario-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
    }
    .scenario-row.row-running { border-left: 3px solid var(--warning); }
    .scenario-row.row-pass { border-left: 3px solid var(--success); }
    .scenario-row.row-fail { border-left: 3px solid var(--danger); }
    .icon { font-weight: 700; font-size: 0.9rem; }
    .icon.pass { color: var(--success); }
    .icon.fail { color: var(--danger); }
    .icon.error { color: var(--warning); }
    .icon.running { color: var(--warning); animation: pulse 1s infinite; }
    .icon.pending { color: var(--text-muted); }
    .scenario-info { flex: 1; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .scenario-name { font-weight: 600; }
    .scenario-type { font-size: 0.7rem; }
    .badge-positive { background: rgba(34,197,94,0.15); color: var(--success); }
    .badge-negative { background: rgba(239,68,68,0.15); color: var(--danger); }
    .badge-boundary { background: rgba(245,158,11,0.15); color: var(--warning); }
    .badge-edge_case { background: rgba(99,102,241,0.15); color: var(--accent-primary); }
    .scenario-steps, .scenario-duration { color: var(--text-secondary); font-size: 0.85rem; }

    .log-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem;
      max-height: 400px;
      overflow-y: auto;
    }
    .log-entry {
      padding: 0.3rem 0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.85rem;
      display: flex;
      gap: 0.75rem;
    }
    .log-time { color: var(--text-muted); min-width: 80px; }
    .log-info .log-msg { color: var(--text-secondary); }
    .log-success .log-msg { color: var(--success); }
    .log-error .log-msg { color: var(--danger); }
    .log-step .log-msg { color: var(--info); }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
  `]
})
export class TestExecutionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  testId = '';
  private eventSource: EventSource | null = null;

  readonly phase = signal<'generating' | 'running' | 'completed' | 'error'>('generating');
  readonly statusMessage = signal('Connecting...');
  readonly totalScenarios = signal(0);
  readonly completedCount = signal(0);
  readonly scenarios = signal<ScenarioProgress[]>([]);
  readonly logEntries = signal<LogEntry[]>([]);
  readonly overallProgress = signal(0);

  private statusCheckInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.testId = this.route.snapshot.paramMap.get('testId') || '';
    if (!this.testId) {
      this.router.navigate(['/']);
      return;
    }
    this.connectSse();
    this.startStatusPolling();
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  private connectSse(): void {
    this.eventSource = this.api.createEventSource(this.testId);
    this.addLog('info', 'Connected to test execution stream');

    this.eventSource.addEventListener('status', (event) => {
      const data: SseStatusEvent = JSON.parse((event as MessageEvent).data);
      if (data.status === 'GENERATING_SCENARIOS') {
        this.phase.set('generating');
        this.statusMessage.set(data.message || 'Analyzing page and generating scenarios...');
      } else if (data.status === 'EXECUTING_TESTS') {
        this.phase.set('running');
        this.statusMessage.set(data.message || 'Running test scenarios...');
      }
      this.addLog('info', data.message || data.status);
    });

    this.eventSource.addEventListener('scenarios_generated', (event) => {
      const data: SseScenariosGeneratedEvent = JSON.parse((event as MessageEvent).data);
      this.totalScenarios.set(data.total);
      this.addLog('success', data.message);
    });

    this.eventSource.addEventListener('scenario_start', (event) => {
      const data: SseScenarioStartEvent = JSON.parse((event as MessageEvent).data);
      this.scenarios.update(list => [...list, {
        index: data.index,
        name: data.name,
        type: data.type,
        totalSteps: data.totalSteps,
        completedSteps: 0,
        status: 'RUNNING',
        durationMs: 0
      }]);
      this.addLog('info', `Starting: ${data.name} (${data.type})`);
    });

    this.eventSource.addEventListener('step_update', (event) => {
      const data: SseStepUpdateEvent = JSON.parse((event as MessageEvent).data);
      this.scenarios.update(list => list.map(s =>
        s.index === data.scenarioIndex
          ? { ...s, completedSteps: data.stepNumber }
          : s
      ));
      this.addLog('step', `Step ${data.stepNumber}: ${data.action} - ${data.status} (${data.durationMs}ms)`);
    });

    this.eventSource.addEventListener('scenario_complete', (event) => {
      const data: SseScenarioCompleteEvent = JSON.parse((event as MessageEvent).data);
      this.scenarios.update(list => list.map(s =>
        s.index === data.index
          ? { ...s, status: data.status, durationMs: data.durationMs }
          : s
      ));
      this.completedCount.update(c => c + 1);
      const total = this.totalScenarios();
      if (total > 0) {
        this.overallProgress.set((this.completedCount() / total) * 100);
      }
      const logType = data.status === 'PASS' ? 'success' : 'error';
      this.addLog(logType, `${data.name}: ${data.status} (${this.formatDuration(data.durationMs)})`);
    });

    this.eventSource.addEventListener('completed', (event) => {
      const data: SseCompletedEvent = JSON.parse((event as MessageEvent).data);
      this.phase.set('completed');
      this.overallProgress.set(100);
      const rate = Number(data.passRate).toFixed(1);
      this.statusMessage.set(
        `Complete! ${data.passed}/${data.totalScenarios} passed (${rate}%)`
      );
      this.addLog('success', `All tests complete. Pass rate: ${rate}%`);
      this.eventSource?.close();
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
      }
    });

    this.eventSource.addEventListener('error', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        this.phase.set('error');
        this.statusMessage.set('Error: ' + (data.message || 'Unknown error'));
        this.addLog('error', data.message || 'Test execution error');
      } catch {
        // SSE connection error (not a data event)
      }
    });

    this.eventSource.onerror = () => {
      if (this.phase() !== 'completed') {
        this.addLog('info', 'Stream connection closed');
      }
    };
  }

  private startStatusPolling(): void {
    this.statusCheckInterval = setInterval(() => {
      if (this.phase() === 'completed' || this.phase() === 'error') {
        if (this.statusCheckInterval) {
          clearInterval(this.statusCheckInterval);
        }
        return;
      }

      this.api.healthCheck().subscribe(); // keep-alive

      fetch(`${this.api.getBaseUrl()}/tests/${this.testId}/status`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'COMPLETED' && this.phase() !== 'completed') {
            this.phase.set('completed');
            this.overallProgress.set(100);
            this.statusMessage.set('Test execution complete! Loading report...');
            this.addLog('success', 'Test execution completed');
            this.eventSource?.close();
            if (this.statusCheckInterval) {
              clearInterval(this.statusCheckInterval);
            }
          }
        })
        .catch(() => { /* polling failure is non-critical */ });
    }, 3000);
  }

  private addLog(type: LogEntry['type'], message: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logEntries.update(entries => [...entries, { time, message, type }]);
  }
}
