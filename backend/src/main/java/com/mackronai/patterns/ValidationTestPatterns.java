package com.mackronai.patterns;

import com.mackronai.model.PageElement;
import com.mackronai.model.TestScenario;
import com.mackronai.model.TestStep;
import com.mackronai.model.enums.ScenarioType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class ValidationTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "validation";
    }

    @Override
    public List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements) {
        List<TestScenario> scenarios = new ArrayList<>();

        scenarios.add(createScenario("Required Field Indicators",
                "Verify required fields have visual indicators (asterisk, etc.)",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENTS", "Locate all required field indicators", "Indicators found"),
                        new TestStep(3, "VERIFY_ELEMENT", "Verify visual distinction for required fields", "Indicators visible"),
                        new TestStep(4, "SCREENSHOT", "Capture field indicators", "Screenshot captured")
                )));

        scenarios.add(createScenario("Inline Validation on Blur",
                "Verify validation triggers when field loses focus",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Focus on first required field", "Field focused"),
                        new TestStep(3, "CLICK", "Click outside the field (blur)", "Field loses focus"),
                        new TestStep(4, "VERIFY_TEXT", "Check for inline validation message", "Validation message shown"),
                        new TestStep(5, "SCREENSHOT", "Capture inline validation", "Screenshot captured")
                )));

        scenarios.add(createScenario("Email Format Validation",
                "Verify various invalid email formats are rejected",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "TYPE", "Enter 'plaintext' in email field", "Text entered"),
                        new TestStep(3, "VERIFY_TEXT", "Check for validation error", "Error shown"),
                        new TestStep(4, "CLEAR", "Clear and enter 'user@'", "Partial email entered"),
                        new TestStep(5, "VERIFY_TEXT", "Check for validation error", "Error shown"),
                        new TestStep(6, "CLEAR", "Clear and enter '@domain.com'", "No user part"),
                        new TestStep(7, "VERIFY_TEXT", "Check for validation error", "Error shown"),
                        new TestStep(8, "SCREENSHOT", "Capture validation states", "Screenshot captured")
                )));

        scenarios.add(createScenario("Number Field Accepts Only Numbers",
                "Verify numeric fields reject non-numeric input",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENT", "Find number/numeric input field", "Field found"),
                        new TestStep(3, "TYPE", "Enter alphabetic text: 'abcdef'", "Text entered"),
                        new TestStep(4, "VERIFY_VALUE", "Check field rejects or flags non-numeric", "Input handled"),
                        new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
                )));

        scenarios.add(createScenario("Min/Max Value Boundaries",
                "Verify number fields enforce min/max constraints",
                ScenarioType.BOUNDARY, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENT", "Find numeric field with min/max attributes", "Field found"),
                        new TestStep(3, "TYPE", "Enter value below minimum", "Below-min value entered"),
                        new TestStep(4, "VERIFY_TEXT", "Check for boundary validation error", "Error shown"),
                        new TestStep(5, "CLEAR", "Clear and enter value above maximum", "Above-max value entered"),
                        new TestStep(6, "VERIFY_TEXT", "Check for boundary validation error", "Error shown"),
                        new TestStep(7, "SCREENSHOT", "Capture boundary states", "Screenshot captured")
                )));

        scenarios.add(createScenario("Copy-Paste into Validated Fields",
                "Verify validation works on pasted content, not just typed",
                ScenarioType.EDGE_CASE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENT", "Find validated input field", "Field found"),
                        new TestStep(3, "PASTE", "Paste invalid data into field", "Data pasted"),
                        new TestStep(4, "CLICK", "Trigger validation (blur or submit)", "Validation triggered"),
                        new TestStep(5, "VERIFY_TEXT", "Check validation catches pasted invalid data", "Error shown"),
                        new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
                )));

        scenarios.add(createScenario("Validation Message Clearance",
                "Verify error messages clear when valid data is entered",
                ScenarioType.EDGE_CASE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "TYPE", "Enter invalid data to trigger error", "Error triggered"),
                        new TestStep(3, "VERIFY_TEXT", "Confirm error message visible", "Error visible"),
                        new TestStep(4, "CLEAR", "Clear field", "Field cleared"),
                        new TestStep(5, "TYPE", "Enter valid data", "Valid data entered"),
                        new TestStep(6, "VERIFY_TEXT", "Verify error message is gone", "Error cleared"),
                        new TestStep(7, "SCREENSHOT", "Capture cleared state", "Screenshot captured")
                )));

        return scenarios;
    }

    private TestScenario createScenario(String name, String description,
                                         ScenarioType type, List<TestStep> steps) {
        TestScenario scenario = new TestScenario(
                UUID.randomUUID().toString().substring(0, 8),
                name, description, type);
        scenario.setSteps(steps);
        return scenario;
    }
}
