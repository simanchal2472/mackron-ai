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
      <div class="exec-header">
        <p class="exec-eyebrow">Execution</p>
        <h1 class="exec-title">Test In Progress</h1>
        <p class="exec-id">{{ testId }}</p>
      </div>

      <div class="status-banner" [class]="'status-' + phase()">
        <div class="status-dot"></div>
        <span class="status-text">{{ statusMessage() }}</span>
      </div>

      @if (totalScenarios() > 0) {
        <section class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Progress</span>
            <span class="progress-count">{{ completedCount() }} / {{ totalScenarios() }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="overallProgress()"></div>
          </div>

          <div class="scenarios-list">
            @for (s of scenarios(); track s.index) {
              <div class="scenario-row" [class]="'row-' + s.status.toLowerCase()">
                <div class="scenario-icon">
                  @switch (s.status) {
                    @case ('PASS') { <span class="icon pass">&#10004;</span> }
                    @case ('FAIL') { <span class="icon fail">&#10008;</span> }
                    @case ('ERROR') { <span class="icon error">!</span> }
                    @case ('RUNNING') { <span class="icon running"></span> }
                    @default { <span class="icon pending"></span> }
                  }
                </div>
                <div class="scenario-info">
                  <span class="scenario-name">{{ s.name }}</span>
                  <span class="scenario-type">{{ s.type }}</span>
                </div>
                <div class="scenario-meta">
                  <span class="scenario-steps">{{ s.completedSteps }}/{{ s.totalSteps }}</span>
                  @if (s.durationMs > 0) {
                    <span class="scenario-duration">{{ formatDuration(s.durationMs) }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </section>
      }

      <section class="log-section">
        <div class="log-header">
          <span class="log-label">Live Log</span>
          @if (phase() === 'running' || phase() === 'generating') {
            <span class="log-live-dot"></span>
          }
        </div>
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

    .exec-header { text-align: center; margin-bottom: 2.5rem; }
    .exec-eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-primary);
      margin-bottom: 0.5rem;
    }
    .exec-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.35rem;
    }
    .exec-id {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    /* ── Status Banner ── */
    .status-banner {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-sm);
      margin-bottom: 2.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
    }
    .status-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--text-muted);
      flex-shrink: 0;
    }
    .status-text { font-weight: 500; font-size: 0.9rem; }
    .status-generating .status-dot { background: var(--info); animation: pulse 1.5s infinite; }
    .status-running .status-dot { background: var(--accent-primary); animation: pulse 1s infinite; }
    .status-completed .status-dot { background: var(--success); }
    .status-error .status-dot { background: var(--danger); }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* ── Progress ── */
    .progress-section { margin-bottom: 2.5rem; }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .progress-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .progress-count {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-primary);
    }
    .progress-bar {
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent-gradient);
      border-radius: 2px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .scenarios-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border-radius: var(--radius-sm); overflow: hidden; }
    .scenario-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1.25rem;
      background: var(--bg-secondary);
      font-size: 0.875rem;
    }
    .scenario-icon { width: 20px; display: flex; align-items: center; justify-content: center; }
    .icon { font-weight: 700; font-size: 0.8rem; }
    .icon.pass { color: var(--success); }
    .icon.fail { color: var(--danger); }
    .icon.error { color: var(--warning); }
    .icon.running {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--accent-primary);
      animation: pulse 1s infinite;
    }
    .icon.pending {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .scenario-info { flex: 1; display: flex; align-items: center; gap: 0.6rem; }
    .scenario-name { font-weight: 500; }
    .scenario-type {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      padding: 0.15rem 0.5rem;
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
    }
    .scenario-meta { display: flex; align-items: center; gap: 0.75rem; }
    .scenario-steps { color: var(--text-muted); font-size: 0.8rem; }
    .scenario-duration { color: var(--text-muted); font-size: 0.8rem; }

    /* ── Log ── */
    .log-section { margin-bottom: 2rem; }
    .log-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .log-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .log-live-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 1.5s infinite;
    }
    .log-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      max-height: 360px;
      overflow-y: auto;
    }
    .log-entry {
      padding: 0.25rem 0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.8rem;
      display: flex;
      gap: 0.75rem;
    }
    .log-time { color: var(--text-muted); min-width: 75px; font-size: 0.75rem; }
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
  private lastSseEventTime = 0;

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
      this.lastSseEventTime = Date.now();
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
      this.lastSseEventTime = Date.now();
      const data: SseScenariosGeneratedEvent = JSON.parse((event as MessageEvent).data);
      this.totalScenarios.set(data.total);
      this.addLog('success', data.message);
    });

    this.eventSource.addEventListener('scenario_start', (event) => {
      this.lastSseEventTime = Date.now();
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
      this.lastSseEventTime = Date.now();
      const data: SseStepUpdateEvent = JSON.parse((event as MessageEvent).data);
      this.scenarios.update(list => list.map(s =>
        s.index === data.scenarioIndex
          ? { ...s, completedSteps: data.stepNumber }
          : s
      ));
      this.addLog('step', `Step ${data.stepNumber}: ${data.action} - ${data.status} (${data.durationMs}ms)`);
    });

    this.eventSource.addEventListener('scenario_complete', (event) => {
      this.lastSseEventTime = Date.now();
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
      this.lastSseEventTime = Date.now();
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

      const sseRecentlyActive = this.lastSseEventTime > 0
        && (Date.now() - this.lastSseEventTime) < 30000;
      if (sseRecentlyActive) {
        return;
      }

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
          } else if (data.status === 'ERROR' && this.phase() !== 'error') {
            this.phase.set('error');
            this.statusMessage.set('Test execution failed');
            this.addLog('error', 'Test execution failed on server');
            this.eventSource?.close();
            if (this.statusCheckInterval) {
              clearInterval(this.statusCheckInterval);
            }
          }
        })
        .catch(() => { /* polling failure is non-critical */ });
    }, 20000);
  }

  private addLog(type: LogEntry['type'], message: string): void {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logEntries.update(entries => [...entries, { time, message, type }]);
  }
}
