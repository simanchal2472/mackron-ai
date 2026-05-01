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
public class FormTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "form";
    }

    @Override
    public List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements) {
        List<TestScenario> scenarios = new ArrayList<>();
        scenarios.addAll(positiveScenarios(targetUrl));
        scenarios.addAll(negativeScenarios(targetUrl));
        scenarios.addAll(boundaryScenarios(targetUrl));
        scenarios.addAll(edgeCaseScenarios(targetUrl));
        return scenarios;
    }

    private List<TestScenario> positiveScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario allValidFields = new TestScenario(
                uid(), "Submit Form With All Valid Fields",
                "Verify successful form submission with all required fields filled correctly",
                ScenarioType.POSITIVE);
        allValidFields.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads successfully"),
                new TestStep(2, "FIND_ELEMENTS", "Identify all form input fields", "Fields identified"),
                new TestStep(3, "TYPE", "Fill all required text fields with valid data", "Fields populated"),
                new TestStep(4, "SELECT", "Select valid options in dropdowns (if any)", "Options selected"),
                new TestStep(5, "CLICK", "Click submit button", "Form submitted"),
                new TestStep(6, "VERIFY_TEXT", "Verify success message or redirect", "Success confirmed"),
                new TestStep(7, "SCREENSHOT", "Capture success state", "Screenshot captured")
        ));
        scenarios.add(allValidFields);

        TestScenario optionalEmpty = new TestScenario(
                uid(), "Submit With Optional Fields Empty",
                "Verify form submits with only required fields filled",
                ScenarioType.POSITIVE);
        optionalEmpty.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Fill only required fields with valid data", "Required fields filled"),
                new TestStep(3, "CLICK", "Click submit button", "Form submitted"),
                new TestStep(4, "VERIFY_TEXT", "Verify success", "Form accepted"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(optionalEmpty);

        return scenarios;
    }

    private List<TestScenario> negativeScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario missingRequired = new TestScenario(
                uid(), "Missing Required Fields",
                "Verify validation errors when required fields are empty",
                ScenarioType.NEGATIVE);
        missingRequired.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "CLICK", "Click submit without filling any fields", "Form submission attempted"),
                new TestStep(3, "VERIFY_TEXT", "Check for required field validation messages", "Validation errors shown"),
                new TestStep(4, "SCREENSHOT", "Capture validation state", "Screenshot captured")
        ));
        scenarios.add(missingRequired);

        TestScenario invalidEmail = new TestScenario(
                uid(), "Invalid Email Format",
                "Verify email validation for various invalid formats",
                ScenarioType.NEGATIVE);
        invalidEmail.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "FIND_ELEMENT", "Find email input field", "Email field found"),
                new TestStep(3, "TYPE", "Enter invalid email: 'not-an-email'", "Text entered"),
                new TestStep(4, "CLICK", "Click submit or tab out", "Validation triggered"),
                new TestStep(5, "VERIFY_TEXT", "Check for email validation error", "Error shown"),
                new TestStep(6, "CLEAR", "Clear field and enter: 'user@'", "Partial email entered"),
                new TestStep(7, "VERIFY_TEXT", "Check for validation error", "Error shown"),
                new TestStep(8, "SCREENSHOT", "Capture validation states", "Screenshot captured")
        ));
        scenarios.add(invalidEmail);

        TestScenario invalidPhone = new TestScenario(
                uid(), "Invalid Phone Number",
                "Verify phone number validation",
                ScenarioType.NEGATIVE);
        invalidPhone.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "FIND_ELEMENT", "Find phone input field", "Phone field found"),
                new TestStep(3, "TYPE", "Enter alphabetic phone: 'abcdefghij'", "Text entered"),
                new TestStep(4, "CLICK", "Trigger validation", "Validation triggered"),
                new TestStep(5, "VERIFY_TEXT", "Check for phone validation error", "Error shown"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(invalidPhone);

        return scenarios;
    }

    private List<TestScenario> boundaryScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario fieldLengthLimits = new TestScenario(
                uid(), "Field Length Limits",
                "Verify max length enforcement on text fields",
                ScenarioType.BOUNDARY);
        fieldLengthLimits.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "FIND_ELEMENTS", "Identify text fields with maxlength", "Fields found"),
                new TestStep(3, "TYPE", "Enter text exceeding maxlength by 50 chars", "Text entered or truncated"),
                new TestStep(4, "VERIFY_VALUE", "Verify field value respects maxlength", "Length constraint honored"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(fieldLengthLimits);

        TestScenario specialCharsInName = new TestScenario(
                uid(), "Special Characters in Name Fields",
                "Verify name fields handle special characters properly",
                ScenarioType.BOUNDARY);
        specialCharsInName.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter name with hyphens/apostrophes: O'Brien-Smith", "Text entered"),
                new TestStep(3, "CLICK", "Submit form", "Form submitted"),
                new TestStep(4, "VERIFY_TEXT", "Check form accepts special name chars", "Accepted or clear error"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(specialCharsInName);

        TestScenario veryLongInput = new TestScenario(
                uid(), "Very Long Input (1000+ chars)",
                "Verify fields handle extremely long input",
                ScenarioType.BOUNDARY);
        veryLongInput.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter 1000-character string in text field", "Long text entered"),
                new TestStep(3, "CLICK", "Submit form", "Form submitted"),
                new TestStep(4, "VERIFY_TEXT", "Verify graceful handling", "No crash, handled appropriately"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(veryLongInput);

        return scenarios;
    }

    private List<TestScenario> edgeCaseScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario formResubmission = new TestScenario(
                uid(), "Form Resubmission Prevention",
                "Verify behavior when form is resubmitted (e.g., refresh after submit)",
                ScenarioType.EDGE_CASE);
        formResubmission.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Fill form with valid data", "Fields filled"),
                new TestStep(3, "CLICK", "Submit form", "Form submitted"),
                new TestStep(4, "RELOAD", "Refresh the page", "Page refreshed"),
                new TestStep(5, "VERIFY_TEXT", "Check for duplicate submission handling", "No duplicate created or warning shown"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(formResubmission);

        TestScenario browserBack = new TestScenario(
                uid(), "Browser Back After Submission",
                "Verify back button behavior after form submission",
                ScenarioType.EDGE_CASE);
        browserBack.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Fill form with valid data", "Fields filled"),
                new TestStep(3, "CLICK", "Submit form", "Form submitted"),
                new TestStep(4, "GO_BACK", "Click browser back", "Navigated back"),
                new TestStep(5, "VERIFY_TEXT", "Check form state (pre-filled or empty)", "Form state observed"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(browserBack);

        return scenarios;
    }

    private String uid() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
