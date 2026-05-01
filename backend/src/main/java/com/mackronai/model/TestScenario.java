package com.mackronai.model;

import com.mackronai.model.enums.ScenarioType;
import com.mackronai.model.enums.TestStatus;

import java.util.ArrayList;
import java.util.List;

public class TestScenario {

    private String id;
    private String name;
    private String description;
    private ScenarioType scenarioType;
    private TestStatus status;
    private List<TestStep> steps;
    private long durationMs;
    private String errorMessage;

    public TestScenario() {
        this.steps = new ArrayList<>();
        this.status = TestStatus.PENDING;
    }

    public TestScenario(String id, String name, String description, ScenarioType scenarioType) {
        this();
        this.id = id;
        this.name = name;
        this.description = description;
        this.scenarioType = scenarioType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ScenarioType getScenarioType() {
        return scenarioType;
    }

    public void setScenarioType(ScenarioType scenarioType) {
        this.scenarioType = scenarioType;
    }

    public TestStatus getStatus() {
        return status;
    }

    public void setStatus(TestStatus status) {
        this.status = status;
    }

    public List<TestStep> getSteps() {
        return steps;
    }

    public void setSteps(List<TestStep> steps) {
        this.steps = steps;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
