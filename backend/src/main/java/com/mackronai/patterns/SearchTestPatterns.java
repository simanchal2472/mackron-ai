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
public class SearchTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "search";
    }

    @Override
    public List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements) {
        List<TestScenario> scenarios = new ArrayList<>();

        scenarios.add(createScenario("Valid Search Query",
                "Verify search returns relevant results for valid query",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENT", "Find search input field", "Search field found"),
                        new TestStep(3, "TYPE", "Enter valid search term", "Term entered"),
                        new TestStep(4, "CLICK", "Click search button or press Enter", "Search executed"),
                        new TestStep(5, "VERIFY_ELEMENT", "Verify results are displayed", "Results shown"),
                        new TestStep(6, "SCREENSHOT", "Capture search results", "Screenshot captured")
                )));

        scenarios.add(createScenario("Empty Search Query",
                "Verify behavior when searching with empty input",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENT", "Find search input field", "Search field found"),
                        new TestStep(3, "CLICK", "Click search without entering text", "Search attempted"),
                        new TestStep(4, "VERIFY_TEXT", "Check for validation or all results shown", "Handled gracefully"),
                        new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
                )));

        scenarios.add(createScenario("No Results Found",
                "Verify friendly message when search yields no results",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "TYPE", "Enter nonsense query: 'zzzzxxxyyy12345'", "Term entered"),
                        new TestStep(3, "CLICK", "Execute search", "Search executed"),
                        new TestStep(4, "VERIFY_TEXT", "Check for 'no results' message", "Empty state shown"),
                        new TestStep(5, "SCREENSHOT", "Capture no-results state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Special Characters in Search",
                "Verify search handles special characters gracefully",
                ScenarioType.BOUNDARY, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "TYPE", "Enter special chars: <>&\"'%;()#", "Special chars entered"),
                        new TestStep(3, "CLICK", "Execute search", "Search executed"),
                        new TestStep(4, "VERIFY_TEXT", "Verify no errors or XSS", "Handled safely"),
                        new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
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
