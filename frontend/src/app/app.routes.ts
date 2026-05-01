import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./features/test-config/test-config.component').then(m => m.TestConfigComponent)
  },
  {
    path: 'execution/:testId',
    loadComponent: () => import('./features/test-execution/test-execution.component').then(m => m.TestExecutionComponent)
  },
  {
    path: 'report/:testId',
    loadComponent: () => import('./features/report/report.component').then(m => m.ReportComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
