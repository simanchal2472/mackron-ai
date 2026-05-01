package com.mackronai.service;

import com.mackronai.model.TestReport;
import com.mackronai.model.TestScenario;
import com.mackronai.model.TestStep;
import com.mackronai.model.enums.ScenarioType;
import com.mackronai.model.enums.TestStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportGeneratorService {

    public TestReport buildReport(String reportId, String targetUrl, String featureName,
                                   List<TestScenario> scenarios, Instant startedAt) {
        TestReport report = new TestReport();
        report.setId(reportId);
        report.setTargetUrl(targetUrl);
        report.setFeatureName(featureName);
        report.setScenarios(scenarios);
        report.setStartedAt(startedAt);
        report.setCompletedAt(Instant.now());

        int passed = 0;
        int failed = 0;
        int skipped = 0;
        int errors = 0;
        long totalDuration = 0;

        for (TestScenario s : scenarios) {
            switch (s.getStatus()) {
                case PASS -> passed++;
                case FAIL -> failed++;
                case SKIP -> skipped++;
                case ERROR -> errors++;
                default -> { /* no-op */ }
            }
            totalDuration += s.getDurationMs();
        }

        report.setTotalScenarios(scenarios.size());
        report.setPassedScenarios(passed);
        report.setFailedScenarios(failed);
        report.setSkippedScenarios(skipped);
        report.setErrorScenarios(errors);
        report.setTotalDurationMs(totalDuration);
        report.setOverallStatus(failed > 0 || errors > 0 ? TestStatus.FAIL : TestStatus.PASS);

        TestReport.ReportSummary summary = new TestReport.ReportSummary();
        summary.setTotalTestCases(scenarios.size());

        int totalSteps = 0;
        int passedSteps = 0;
        int failedSteps = 0;
        List<String> criticalFailures = new ArrayList<>();

        for (TestScenario s : scenarios) {
            for (TestStep step : s.getSteps()) {
                totalSteps++;
                if (step.getStatus() == TestStatus.PASS) passedSteps++;
                if (step.getStatus() == TestStatus.FAIL) failedSteps++;
            }
            if (s.getStatus() == TestStatus.FAIL || s.getStatus() == TestStatus.ERROR) {
                criticalFailures.add(s.getName() + ": " +
                        (s.getErrorMessage() != null ? s.getErrorMessage() : "Failed"));
            }
        }

        summary.setTotalSteps(totalSteps);
        summary.setPassedSteps(passedSteps);
        summary.setFailedSteps(failedSteps);
        summary.setPassRate(totalSteps > 0 ? (passedSteps * 100.0 / totalSteps) : 0);
        summary.setCriticalFailures(criticalFailures);
        report.setSummary(summary);

        return report;
    }

    public String generateHtmlReport(TestReport report) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Mackron AI - Test Report</title>");
        html.append("<style>").append(getReportCss()).append("</style>");
        html.append("</head><body>");

        html.append("<div class='container'>");
        html.append("<header class='header'>");
        html.append("<h1>Mackron AI</h1>");
        html.append("<p class='subtitle'>Web Application Testing Agent - Test Report</p>");
        html.append("</header>");

        html.append("<section class='meta'>");
        html.append("<div class='meta-grid'>");
        html.append(metaCard("Target URL", report.getTargetUrl()));
        html.append(metaCard("Feature", report.getFeatureName()));
        html.append(metaCard("Started", formatInstant(report.getStartedAt())));
        html.append(metaCard("Duration", formatDuration(report.getTotalDurationMs())));
        html.append("</div></section>");

        html.append("<section class='summary'>");
        html.append("<h2>Summary</h2>");
        html.append("<div class='summary-grid'>");
        html.append(summaryCard("Total", String.valueOf(report.getTotalScenarios()), "total"));
        html.append(summaryCard("Passed", String.valueOf(report.getPassedScenarios()), "pass"));
        html.append(summaryCard("Failed", String.valueOf(report.getFailedScenarios()), "fail"));
        html.append(summaryCard("Errors", String.valueOf(report.getErrorScenarios()), "error"));
        html.append(summaryCard("Pass Rate", String.format("%.1f%%", report.getSummary().getPassRate()), "rate"));
        html.append("</div></section>");

        for (ScenarioType type : ScenarioType.values()) {
            List<TestScenario> group = report.getScenarios().stream()
                    .filter(s -> s.getScenarioType() == type).toList();
            if (group.isEmpty()) continue;

            html.append("<section class='scenario-group'>");
            html.append("<h2>").append(type.name().replace("_", " ")).append(" Tests (")
                    .append(group.size()).append(")</h2>");

            for (TestScenario scenario : group) {
                html.append("<div class='scenario ").append(scenario.getStatus().name().toLowerCase()).append("'>");
                html.append("<div class='scenario-header'>");
                html.append("<span class='badge ").append(scenario.getStatus().name().toLowerCase())
                        .append("'>").append(scenario.getStatus()).append("</span>");
                html.append("<h3>").append(escapeHtml(scenario.getName())).append("</h3>");
                html.append("<span class='duration'>").append(formatDuration(scenario.getDurationMs())).append("</span>");
                html.append("</div>");
                html.append("<p class='scenario-desc'>").append(escapeHtml(scenario.getDescription())).append("</p>");

                html.append("<table class='steps-table'>");
                html.append("<thead><tr><th>#</th><th>Action</th><th>Description</th><th>Expected</th><th>Actual</th><th>Status</th><th>Time</th></tr></thead>");
                html.append("<tbody>");

                for (TestStep step : scenario.getSteps()) {
                    html.append("<tr class='step-").append(step.getStatus().name().toLowerCase()).append("'>");
                    html.append("<td>").append(step.getStepNumber()).append("</td>");
                    html.append("<td><code>").append(step.getAction()).append("</code></td>");
                    html.append("<td>").append(escapeHtml(step.getDescription())).append("</td>");
                    html.append("<td>").append(escapeHtml(step.getExpectedResult())).append("</td>");
                    html.append("<td>").append(escapeHtml(step.getActualResult() != null ? step.getActualResult() : "-")).append("</td>");
                    html.append("<td><span class='badge ").append(step.getStatus().name().toLowerCase())
                            .append("'>").append(step.getStatus()).append("</span></td>");
                    html.append("<td>").append(step.getDurationMs()).append("ms</td>");
                    html.append("</tr>");

                    if (step.getScreenshotBase64() != null) {
                        html.append("<tr><td colspan='7' class='screenshot-cell'>");
                        html.append("<img src='data:image/png;base64,").append(step.getScreenshotBase64())
                                .append("' alt='Screenshot step ").append(step.getStepNumber()).append("' class='screenshot'/>");
                        html.append("</td></tr>");
                    }
                }

                html.append("</tbody></table></div>");
            }
            html.append("</section>");
        }

        html.append("<footer class='footer'>");
        html.append("<p>Generated by <strong>Mackron AI</strong> Testing Agent</p>");
        html.append("</footer>");
        html.append("</div></body></html>");

        return html.toString();
    }

    private String metaCard(String label, String value) {
        return "<div class='meta-card'><span class='meta-label'>" + label +
                "</span><span class='meta-value'>" + escapeHtml(value) + "</span></div>";
    }

    private String summaryCard(String label, String value, String type) {
        return "<div class='summary-card " + type + "'><div class='summary-value'>" +
                value + "</div><div class='summary-label'>" + label + "</div></div>";
    }

    private String formatInstant(Instant instant) {
        if (instant == null) return "N/A";
        return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.systemDefault()).format(instant);
    }

    private String formatDuration(long ms) {
        if (ms < 1000) return ms + "ms";
        if (ms < 60000) return String.format("%.1fs", ms / 1000.0);
        return String.format("%dm %ds", ms / 60000, (ms % 60000) / 1000);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String getReportCss() {
        return """
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                   background: #0f172a; color: #e2e8f0; line-height: 1.6; }
            .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
            .header { text-align: center; padding: 2rem 0; border-bottom: 2px solid #1e293b; margin-bottom: 2rem; }
            .header h1 { font-size: 2.5rem; background: linear-gradient(135deg, #6366f1, #8b5cf6);
                         -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .subtitle { color: #94a3b8; font-size: 1.1rem; margin-top: 0.5rem; }
            .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .meta-card { background: #1e293b; border-radius: 8px; padding: 1rem; }
            .meta-label { display: block; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
            .meta-value { display: block; color: #f1f5f9; font-weight: 600; margin-top: 0.25rem; word-break: break-all; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .summary-card { background: #1e293b; border-radius: 12px; padding: 1.5rem; text-align: center; border-left: 4px solid #475569; }
            .summary-card.pass { border-left-color: #22c55e; }
            .summary-card.fail { border-left-color: #ef4444; }
            .summary-card.error { border-left-color: #f59e0b; }
            .summary-card.rate { border-left-color: #6366f1; }
            .summary-value { font-size: 2rem; font-weight: 700; }
            .summary-label { color: #94a3b8; margin-top: 0.25rem; }
            h2 { font-size: 1.5rem; margin: 1.5rem 0 1rem; color: #f1f5f9; }
            .scenario { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid #475569; }
            .scenario.pass { border-left-color: #22c55e; }
            .scenario.fail { border-left-color: #ef4444; }
            .scenario.error { border-left-color: #f59e0b; }
            .scenario-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
            .scenario-header h3 { flex: 1; }
            .scenario-desc { color: #94a3b8; margin: 0.5rem 0 1rem; }
            .duration { color: #94a3b8; font-size: 0.9rem; }
            .badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
            .badge.pass { background: #166534; color: #86efac; }
            .badge.fail { background: #7f1d1d; color: #fca5a5; }
            .badge.error { background: #78350f; color: #fde68a; }
            .badge.skip { background: #334155; color: #94a3b8; }
            .badge.running { background: #1e3a5f; color: #93c5fd; }
            .badge.pending { background: #334155; color: #94a3b8; }
            .steps-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
            .steps-table th { background: #0f172a; padding: 0.75rem; text-align: left; color: #94a3b8; font-weight: 600; }
            .steps-table td { padding: 0.75rem; border-top: 1px solid #334155; }
            .step-pass td { background: rgba(34,197,94,0.05); }
            .step-fail td { background: rgba(239,68,68,0.05); }
            .step-skip td { opacity: 0.5; }
            code { background: #334155; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85rem; }
            .screenshot-cell { text-align: center; padding: 1rem !important; }
            .screenshot { max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #334155; }
            .footer { text-align: center; padding: 2rem 0; margin-top: 3rem; border-top: 1px solid #1e293b; color: #64748b; }
            @media (max-width: 768px) { .container { padding: 1rem; } .steps-table { font-size: 0.8rem; } }
            """;
    }
}
