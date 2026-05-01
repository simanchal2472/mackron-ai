package com.mackronai.service;

import com.mackronai.model.TestReport;
import com.mackronai.model.TestRequest;
import com.mackronai.model.TestScenario;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TestEngineService {

    private static final Logger log = LoggerFactory.getLogger(TestEngineService.class);

    private final ScenarioGeneratorService scenarioGenerator;
    private final PlaywrightRunnerService playwrightRunner;
    private final ReportGeneratorService reportGenerator;
    private final ObjectMapper objectMapper;

    private final Map<String, TestReport> reportStore = new ConcurrentHashMap<>();
    private final Map<String, SseEmitter> emitterStore = new ConcurrentHashMap<>();
    private final Map<String, String> statusStore = new ConcurrentHashMap<>();
    private final Map<String, TestRequest> pendingRequests = new ConcurrentHashMap<>();

    public TestEngineService(ScenarioGeneratorService scenarioGenerator,
                              PlaywrightRunnerService playwrightRunner,
                              ReportGeneratorService reportGenerator,
                              ObjectMapper objectMapper) {
        this.scenarioGenerator = scenarioGenerator;
        this.playwrightRunner = playwrightRunner;
        this.reportGenerator = reportGenerator;
        this.objectMapper = objectMapper;
    }

    public String submitTest(TestRequest request) {
        String testId = UUID.randomUUID().toString();
        statusStore.put(testId, "WAITING_FOR_CLIENT");
        pendingRequests.put(testId, request);
        return testId;
    }

    public SseEmitter createEmitter(String testId) {
        SseEmitter emitter = new SseEmitter(600_000L);
        emitterStore.put(testId, emitter);

        emitter.onCompletion(() -> emitterStore.remove(testId));
        emitter.onTimeout(() -> emitterStore.remove(testId));
        emitter.onError(e -> emitterStore.remove(testId));

        TestRequest pendingRequest = pendingRequests.remove(testId);
        if (pendingRequest != null) {
            statusStore.put(testId, "GENERATING_SCENARIOS");
            sendEvent(testId, "status", Map.of("status", "GENERATING_SCENARIOS",
                    "message", "Analyzing page and generating test scenarios..."));
            executeTestAsync(testId, pendingRequest);
        } else {
            String currentStatus = statusStore.get(testId);
            if (currentStatus != null) {
                sendEvent(testId, "status", Map.of("status", currentStatus));
            }
        }

        return emitter;
    }

    public TestReport getReport(String testId) {
        return reportStore.get(testId);
    }

    public String getHtmlReport(String testId) {
        TestReport report = reportStore.get(testId);
        if (report == null) return null;
        return reportGenerator.generateHtmlReport(report);
    }

    public Map<String, String> getStatus(String testId) {
        String status = statusStore.getOrDefault(testId, "NOT_FOUND");
        return Map.of("testId", testId, "status", status);
    }

    public List<Map<String, String>> getHistory() {
        return reportStore.entrySet().stream()
                .map(e -> Map.of(
                        "id", e.getKey(),
                        "targetUrl", e.getValue().getTargetUrl(),
                        "featureName", e.getValue().getFeatureName(),
                        "status", e.getValue().getOverallStatus().name(),
                        "totalScenarios", String.valueOf(e.getValue().getTotalScenarios()),
                        "passRate", String.format("%.1f", e.getValue().getSummary().getPassRate())
                ))
                .toList();
    }

    @Async("testExecutor")
    protected void executeTestAsync(String testId, TestRequest request) {
        Instant startedAt = Instant.now();
        try {
            List<TestScenario> scenarios = scenarioGenerator.generateScenarios(request);

            sendEvent(testId, "scenarios_generated", Map.of(
                    "total", scenarios.size(),
                    "message", "Generated " + scenarios.size() + " test scenarios"
            ));

            statusStore.put(testId, "EXECUTING_TESTS");
            sendEvent(testId, "status", Map.of("status", "EXECUTING_TESTS", "message", "Running test scenarios..."));

            for (int i = 0; i < scenarios.size(); i++) {
                TestScenario scenario = scenarios.get(i);
                int scenarioIndex = i;

                sendEvent(testId, "scenario_start", Map.of(
                        "index", scenarioIndex,
                        "name", scenario.getName(),
                        "type", scenario.getScenarioType().name(),
                        "totalSteps", scenario.getSteps().size()
                ));

                playwrightRunner.executeScenario(scenario, request.getUrl(),
                        request.getUsername(), request.getPassword(),
                        step -> sendEvent(testId, "step_update", Map.of(
                                "scenarioIndex", scenarioIndex,
                                "stepNumber", step.getStepNumber(),
                                "action", step.getAction(),
                                "status", step.getStatus().name(),
                                "durationMs", step.getDurationMs()
                        )));

                sendEvent(testId, "scenario_complete", Map.of(
                        "index", scenarioIndex,
                        "name", scenario.getName(),
                        "status", scenario.getStatus().name(),
                        "durationMs", scenario.getDurationMs()
                ));
            }

            TestReport report = reportGenerator.buildReport(testId, request.getUrl(),
                    request.getFeatureName(), scenarios, startedAt);
            reportStore.put(testId, report);
            statusStore.put(testId, "COMPLETED");

            sendEvent(testId, "completed", Map.of(
                    "status", "COMPLETED",
                    "totalScenarios", report.getTotalScenarios(),
                    "passed", report.getPassedScenarios(),
                    "failed", report.getFailedScenarios(),
                    "passRate", report.getSummary().getPassRate(),
                    "durationMs", report.getTotalDurationMs()
            ));

            completeEmitter(testId);

        } catch (Exception e) {
            log.error("Test execution failed for {}: {}", testId, e.getMessage(), e);
            statusStore.put(testId, "ERROR");
            sendEvent(testId, "error", Map.of("message", e.getMessage()));
            completeEmitter(testId);
        }
    }

    private void sendEvent(String testId, String eventName, Object data) {
        SseEmitter emitter = emitterStore.get(testId);
        if (emitter == null) return;

        try {
            String json = objectMapper.writeValueAsString(data);
            emitter.send(SseEmitter.event().name(eventName).data(json));
        } catch (Exception e) {
            log.debug("Failed to send SSE event '{}' for test {}: {}", eventName, testId, e.getMessage());
            emitterStore.remove(testId);
        }
    }

    private void completeEmitter(String testId) {
        SseEmitter emitter = emitterStore.remove(testId);
        if (emitter != null) {
            try {
                emitter.complete();
            } catch (Exception e) {
                log.debug("Error completing emitter for test {}", testId);
            }
        }
    }
}
