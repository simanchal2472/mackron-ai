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
public class NavigationTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "navigation";
    }

    @Override
    public List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements) {
        List<TestScenario> scenarios = new ArrayList<>();

        scenarios.add(createScenario("All Links Accessible",
                "Verify all navigation links load without errors",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENTS", "Collect all <a> links on page", "Links collected"),
                        new TestStep(3, "VERIFY_LINKS", "Visit each link and verify HTTP 200", "All links accessible"),
                        new TestStep(4, "SCREENSHOT", "Capture navigation state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Broken Link Detection",
                "Check for any broken links returning 404 or errors",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "FIND_ELEMENTS", "Collect all href attributes", "Links collected"),
                        new TestStep(3, "CHECK_STATUS", "HTTP HEAD request each URL", "Status codes recorded"),
                        new TestStep(4, "VERIFY_TEXT", "Flag any non-2xx responses", "Broken links identified"),
                        new TestStep(5, "SCREENSHOT", "Capture results", "Screenshot captured")
                )));

        scenarios.add(createScenario("404 Page Handling",
                "Verify behavior when navigating to non-existent path",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl + "/non-existent-page-xyz", "Request sent"),
                        new TestStep(2, "VERIFY_TEXT", "Check for 404 page or friendly error", "Error page shown"),
                        new TestStep(3, "SCREENSHOT", "Capture 404 page", "Screenshot captured")
                )));

        scenarios.add(createScenario("Page Load Performance",
                "Verify page loads within acceptable time",
                ScenarioType.BOUNDARY, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl + " and measure load time", "Page loads"),
                        new TestStep(2, "MEASURE_TIME", "Record DOM content loaded time", "Time recorded"),
                        new TestStep(3, "VERIFY_VALUE", "Verify load time under 10 seconds", "Performance acceptable"),
                        new TestStep(4, "SCREENSHOT", "Capture loaded page", "Screenshot captured")
                )));

        scenarios.add(createScenario("Browser Back/Forward",
                "Verify browser history navigation works correctly",
                ScenarioType.EDGE_CASE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Click a navigation link", "New page loaded"),
                        new TestStep(3, "GO_BACK", "Click browser back", "Previous page shown"),
                        new TestStep(4, "GO_FORWARD", "Click browser forward", "Next page shown again"),
                        new TestStep(5, "SCREENSHOT", "Capture final state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Page Refresh Preserves State",
                "Verify page content persists after refresh",
                ScenarioType.EDGE_CASE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CAPTURE_STATE", "Record page title and key content", "State captured"),
                        new TestStep(3, "RELOAD", "Refresh the page", "Page reloaded"),
                        new TestStep(4, "VERIFY_STATE", "Compare page content after reload", "Content matches"),
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
