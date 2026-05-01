export type TestStatus = 'PASS' | 'FAIL' | 'SKIP' | 'ERROR' | 'RUNNING' | 'PENDING';
export type ScenarioType = 'POSITIVE' | 'NEGATIVE' | 'BOUNDARY' | 'EDGE_CASE';

export interface TestStep {
  readonly stepNumber: number;
  readonly action: string;
  readonly description: string;
  readonly expectedResult: string;
  readonly actualResult: string | null;
  readonly status: TestStatus;
  readonly screenshotBase64: string | null;
  readonly durationMs: number;
  readonly errorMessage: string | null;
}

export interface TestScenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly scenarioType: ScenarioType;
  readonly status: TestStatus;
  readonly steps: readonly TestStep[];
  readonly durationMs: number;
  readonly errorMessage: string | null;
}

export interface ReportSummary {
  readonly totalTestCases: number;
  readonly totalSteps: number;
  readonly passedSteps: number;
  readonly failedSteps: number;
  readonly passRate: number;
  readonly criticalFailures: readonly string[];
}

export interface TestReport {
  readonly id: string;
  readonly targetUrl: string;
  readonly featureName: string;
  readonly overallStatus: TestStatus;
  readonly totalScenarios: number;
  readonly passedScenarios: number;
  readonly failedScenarios: number;
  readonly skippedScenarios: number;
  readonly errorScenarios: number;
  readonly totalDurationMs: number;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly scenarios: readonly TestScenario[];
  readonly summary: ReportSummary;
}

export interface TestHistoryItem {
  readonly id: string;
  readonly targetUrl: string;
  readonly featureName: string;
  readonly status: string;
  readonly totalScenarios: string;
  readonly passRate: string;
}
