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
public class CrudTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "crud";
    }

    @Override
    public List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements) {
        List<TestScenario> scenarios = new ArrayList<>();

        scenarios.add(createScenario("Create Operation - Valid Data",
                "Verify creating a new record with valid data",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Click 'Add New' or 'Create' button", "Create form opens"),
                        new TestStep(3, "TYPE", "Fill all fields with valid data", "Fields populated"),
                        new TestStep(4, "CLICK", "Click Save/Submit", "Record created"),
                        new TestStep(5, "VERIFY_TEXT", "Verify success message or new entry in list", "Record visible"),
                        new TestStep(6, "SCREENSHOT", "Capture created record", "Screenshot captured")
                )));

        scenarios.add(createScenario("Read Operation - View Records",
                "Verify records display correctly in list/table",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "VERIFY_ELEMENT", "Verify table/list of records is visible", "Records displayed"),
                        new TestStep(3, "VERIFY_TEXT", "Check data integrity of displayed records", "Data correct"),
                        new TestStep(4, "SCREENSHOT", "Capture record list", "Screenshot captured")
                )));

        scenarios.add(createScenario("Update Operation - Modify Record",
                "Verify editing an existing record",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Click Edit on first record", "Edit form opens"),
                        new TestStep(3, "CLEAR", "Clear existing field value", "Field cleared"),
                        new TestStep(4, "TYPE", "Enter new value", "New value entered"),
                        new TestStep(5, "CLICK", "Click Save/Update", "Record updated"),
                        new TestStep(6, "VERIFY_TEXT", "Verify updated value in list", "Update confirmed"),
                        new TestStep(7, "SCREENSHOT", "Capture updated record", "Screenshot captured")
                )));

        scenarios.add(createScenario("Delete Operation - Remove Record",
                "Verify deleting a record",
                ScenarioType.POSITIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Click Delete on a record", "Confirmation prompt shown"),
                        new TestStep(3, "CLICK", "Confirm deletion", "Record deleted"),
                        new TestStep(4, "VERIFY_TEXT", "Verify record removed from list", "Record gone"),
                        new TestStep(5, "SCREENSHOT", "Capture post-delete state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Create With Missing Required Fields",
                "Verify validation when required fields are missing",
                ScenarioType.NEGATIVE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Click 'Add New' or 'Create' button", "Create form opens"),
                        new TestStep(3, "CLICK", "Click Save without filling fields", "Submission attempted"),
                        new TestStep(4, "VERIFY_TEXT", "Verify validation errors shown", "Errors displayed"),
                        new TestStep(5, "SCREENSHOT", "Capture validation state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Empty List State",
                "Verify behavior when no records exist",
                ScenarioType.BOUNDARY, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "VERIFY_TEXT", "Check for empty state message or placeholder", "Empty state handled"),
                        new TestStep(3, "SCREENSHOT", "Capture empty state", "Screenshot captured")
                )));

        scenarios.add(createScenario("Rapid Create-Delete Cycle",
                "Verify stability during rapid create and delete operations",
                ScenarioType.EDGE_CASE, List.of(
                        new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                        new TestStep(2, "CLICK", "Create a new record quickly", "Record created"),
                        new TestStep(3, "CLICK", "Immediately delete the created record", "Record deleted"),
                        new TestStep(4, "VERIFY_TEXT", "Verify list is consistent", "No ghost records"),
                        new TestStep(5, "SCREENSHOT", "Capture final state", "Screenshot captured")
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
