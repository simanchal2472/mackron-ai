package com.mackronai.model;

import com.mackronai.model.enums.TestStatus;

public class TestStep {

    private int stepNumber;
    private String action;
    private String description;
    private String expectedResult;
    private String actualResult;
    private TestStatus status;
    private String screenshotBase64;
    private long durationMs;
    private String errorMessage;

    public TestStep() {
    }

    public TestStep(int stepNumber, String action, String description, String expectedResult) {
        this.stepNumber = stepNumber;
        this.action = action;
        this.description = description;
        this.expectedResult = expectedResult;
        this.status = TestStatus.PENDING;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public String getActualResult() {
        return actualResult;
    }

    public void setActualResult(String actualResult) {
        this.actualResult = actualResult;
    }

    public TestStatus getStatus() {
        return status;
    }

    public void setStatus(TestStatus status) {
        this.status = status;
    }

    public String getScreenshotBase64() {
        return screenshotBase64;
    }

    public void setScreenshotBase64(String screenshotBase64) {
        this.screenshotBase64 = screenshotBase64;
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
