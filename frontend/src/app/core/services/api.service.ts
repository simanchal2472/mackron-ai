import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TestRequest } from '../models/test-request.model';
import { TestReport, TestHistoryItem } from '../models/test-report.model';
import { Observable, catchError, retry, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  getBaseUrl(): string {
    return this.baseUrl;
  }

  submitTest(request: TestRequest): Observable<{ testId: string; status: string }> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<{ testId: string; status: string }>(
      `${this.baseUrl}/tests/execute`, request
    ).pipe(
      retry(2),
      catchError(err => {
        this.loadingState.set(false);
        this.errorState.set(err.message || 'Failed to submit test');
        throw err;
      })
    );
  }

  createEventSource(testId: string): EventSource {
    return new EventSource(`${this.baseUrl}/tests/${testId}/stream`);
  }

  getReport(testId: string): Observable<TestReport> {
    return this.http.get<TestReport>(`${this.baseUrl}/tests/${testId}/report`).pipe(
      retry(2),
      catchError(err => {
        this.errorState.set(err.message || 'Failed to fetch report');
        throw err;
      })
    );
  }

  getHtmlReportUrl(testId: string): string {
    return `${this.baseUrl}/tests/${testId}/report/html`;
  }

  getHistory(): Observable<TestHistoryItem[]> {
    return this.http.get<TestHistoryItem[]>(`${this.baseUrl}/tests/history`).pipe(
      retry(1),
      catchError(() => of([]))
    );
  }

  healthCheck(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/health`);
  }

  clearError(): void {
    this.errorState.set(null);
  }

  setLoading(val: boolean): void {
    this.loadingState.set(val);
  }
}
