package com.mackronai.model;

import com.mackronai.model.enums.TestStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class TestReport {

    private String id;
    private String targetUrl;
    private String featureName;
    private TestStatus overallStatus;
    private int totalScenarios;
    private int passedScenarios;
    private int failedScenarios;
    private int skippedScenarios;
    private int errorScenarios;
    private long totalDurationMs;
    private Instant startedAt;
    private Instant completedAt;
    private List<TestScenario> scenarios;
    private ReportSummary summary;

    public TestReport() {
        this.scenarios = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public String getFeatureName() {
        return featureName;
    }

    public void setFeatureName(String featureName) {
        this.featureName = featureName;
    }

    public TestStatus getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(TestStatus overallStatus) {
        this.overallStatus = overallStatus;
    }

    public int getTotalScenarios() {
        return totalScenarios;
    }

    public void setTotalScenarios(int totalScenarios) {
        this.totalScenarios = totalScenarios;
    }

    public int getPassedScenarios() {
        return passedScenarios;
    }

    public void setPassedScenarios(int passedScenarios) {
        this.passedScenarios = passedScenarios;
    }

    public int getFailedScenarios() {
        return failedScenarios;
    }

    public void setFailedScenarios(int failedScenarios) {
        this.failedScenarios = failedScenarios;
    }

    public int getSkippedScenarios() {
        return skippedScenarios;
    }

    public void setSkippedScenarios(int skippedScenarios) {
        this.skippedScenarios = skippedScenarios;
    }

    public int getErrorScenarios() {
        return errorScenarios;
    }

    public void setErrorScenarios(int errorScenarios) {
        this.errorScenarios = errorScenarios;
    }

    public long getTotalDurationMs() {
        return totalDurationMs;
    }

    public void setTotalDurationMs(long totalDurationMs) {
        this.totalDurationMs = totalDurationMs;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public List<TestScenario> getScenarios() {
        return scenarios;
    }

    public void setScenarios(List<TestScenario> scenarios) {
        this.scenarios = scenarios;
    }

    public ReportSummary getSummary() {
        return summary;
    }

    public void setSummary(ReportSummary summary) {
        this.summary = summary;
    }

    public static class ReportSummary {
        private int totalTestCases;
        private int totalSteps;
        private int passedSteps;
        private int failedSteps;
        private double passRate;
        private List<String> criticalFailures;

        public ReportSummary() {
            this.criticalFailures = new ArrayList<>();
        }

        public int getTotalTestCases() {
            return totalTestCases;
        }

        public void setTotalTestCases(int totalTestCases) {
            this.totalTestCases = totalTestCases;
        }

        public int getTotalSteps() {
            return totalSteps;
        }

        public void setTotalSteps(int totalSteps) {
            this.totalSteps = totalSteps;
        }

        public int getPassedSteps() {
            return passedSteps;
        }

        public void setPassedSteps(int passedSteps) {
            this.passedSteps = passedSteps;
        }

        public int getFailedSteps() {
            return failedSteps;
        }

        public void setFailedSteps(int failedSteps) {
            this.failedSteps = failedSteps;
        }

        public double getPassRate() {
            return passRate;
        }

        public void setPassRate(double passRate) {
            this.passRate = passRate;
        }

        public List<String> getCriticalFailures() {
            return criticalFailures;
        }

        public void setCriticalFailures(List<String> criticalFailures) {
            this.criticalFailures = criticalFailures;
        }
    }
}
