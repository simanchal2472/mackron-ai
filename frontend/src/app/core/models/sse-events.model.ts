export interface SseStatusEvent {
  readonly status: string;
  readonly message?: string;
}

export interface SseScenariosGeneratedEvent {
  readonly total: number;
  readonly message: string;
}

export interface SseScenarioStartEvent {
  readonly index: number;
  readonly name: string;
  readonly type: string;
  readonly totalSteps: number;
}

export interface SseStepUpdateEvent {
  readonly scenarioIndex: number;
  readonly stepNumber: number;
  readonly action: string;
  readonly status: string;
  readonly durationMs: number;
}

export interface SseScenarioCompleteEvent {
  readonly index: number;
  readonly name: string;
  readonly status: string;
  readonly durationMs: number;
}

export interface SseCompletedEvent {
  readonly status: string;
  readonly totalScenarios: number;
  readonly passed: number;
  readonly failed: number;
  readonly passRate: number;
  readonly durationMs: number;
}
