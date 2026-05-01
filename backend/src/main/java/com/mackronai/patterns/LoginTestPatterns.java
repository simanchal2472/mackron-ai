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
public class LoginTestPatterns implements TestPatternProvider {

    @Override
    public String getFeatureKeyword() {
        return "login";
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

        TestScenario validLogin = new TestScenario(
                uid(), "Valid Credentials Login",
                "Verify successful login with correct username and password",
                ScenarioType.POSITIVE);
        validLogin.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads successfully"),
                new TestStep(2, "FIND_ELEMENT", "Locate username/email input field", "Input field is visible"),
                new TestStep(3, "TYPE", "Enter valid username", "Username entered successfully"),
                new TestStep(4, "FIND_ELEMENT", "Locate password input field", "Password field is visible"),
                new TestStep(5, "TYPE", "Enter valid password", "Password entered (masked)"),
                new TestStep(6, "CLICK", "Click login/submit button", "Form submitted"),
                new TestStep(7, "WAIT_NAVIGATION", "Wait for page redirect", "Redirected to dashboard/home"),
                new TestStep(8, "SCREENSHOT", "Capture post-login state", "Screenshot captured")
        ));
        scenarios.add(validLogin);

        TestScenario loginPageLoads = new TestScenario(
                uid(), "Login Page Loads Correctly",
                "Verify all login form elements are present and visible",
                ScenarioType.POSITIVE);
        loginPageLoads.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads successfully"),
                new TestStep(2, "VERIFY_ELEMENT", "Check for username field presence", "Username field exists"),
                new TestStep(3, "VERIFY_ELEMENT", "Check for password field presence", "Password field exists"),
                new TestStep(4, "VERIFY_ELEMENT", "Check for submit button presence", "Submit button exists"),
                new TestStep(5, "SCREENSHOT", "Capture login page", "Screenshot captured")
        ));
        scenarios.add(loginPageLoads);

        return scenarios;
    }

    private List<TestScenario> negativeScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario wrongPassword = new TestScenario(
                uid(), "Invalid Password",
                "Verify error message when wrong password is entered",
                ScenarioType.NEGATIVE);
        wrongPassword.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads successfully"),
                new TestStep(2, "TYPE", "Enter valid username", "Username entered"),
                new TestStep(3, "TYPE", "Enter incorrect password 'WrongPass123!'", "Password entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_TEXT", "Check for error message", "Error message displayed"),
                new TestStep(6, "VERIFY_URL", "Verify still on login page", "URL unchanged"),
                new TestStep(7, "SCREENSHOT", "Capture error state", "Screenshot captured")
        ));
        scenarios.add(wrongPassword);

        TestScenario wrongUsername = new TestScenario(
                uid(), "Invalid Username",
                "Verify error when non-existent username is used",
                ScenarioType.NEGATIVE);
        wrongUsername.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter non-existent username 'nonexistent_user_xyz'", "Username entered"),
                new TestStep(3, "TYPE", "Enter any password", "Password entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_TEXT", "Check for error message", "Error message displayed"),
                new TestStep(6, "SCREENSHOT", "Capture error state", "Screenshot captured")
        ));
        scenarios.add(wrongUsername);

        TestScenario emptyFields = new TestScenario(
                uid(), "Empty Fields Submission",
                "Verify validation when both fields are empty",
                ScenarioType.NEGATIVE);
        emptyFields.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "CLICK", "Click login button without entering data", "Form submitted"),
                new TestStep(3, "VERIFY_TEXT", "Check for validation messages", "Validation errors shown"),
                new TestStep(4, "SCREENSHOT", "Capture validation state", "Screenshot captured")
        ));
        scenarios.add(emptyFields);

        TestScenario sqlInjection = new TestScenario(
                uid(), "SQL Injection Attempt",
                "Verify application handles SQL injection in username field",
                ScenarioType.NEGATIVE);
        sqlInjection.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter SQL injection: ' OR '1'='1", "Text entered"),
                new TestStep(3, "TYPE", "Enter password: ' OR '1'='1", "Text entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_TEXT", "Verify no unauthorized access", "Login denied or error shown"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(sqlInjection);

        TestScenario xssAttempt = new TestScenario(
                uid(), "XSS Input Attempt",
                "Verify application sanitizes script tags in input",
                ScenarioType.NEGATIVE);
        xssAttempt.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter XSS payload: <script>alert('xss')</script>", "Text entered"),
                new TestStep(3, "TYPE", "Enter any password", "Password entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_NO_ALERT", "Verify no JavaScript alert appeared", "No alert dialog"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(xssAttempt);

        return scenarios;
    }

    private List<TestScenario> boundaryScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario maxLength = new TestScenario(
                uid(), "Maximum Length Input",
                "Verify behavior with extremely long username/password",
                ScenarioType.BOUNDARY);
        maxLength.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter 256-character username", "Text entered or truncated"),
                new TestStep(3, "TYPE", "Enter 256-character password", "Text entered or truncated"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_TEXT", "Check response (error or truncation)", "Handled gracefully"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(maxLength);

        TestScenario specialChars = new TestScenario(
                uid(), "Special Characters in Credentials",
                "Verify handling of special characters in input fields",
                ScenarioType.BOUNDARY);
        specialChars.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter username with special chars: t@st!#$%^&*()", "Text entered"),
                new TestStep(3, "TYPE", "Enter password with special chars: P@$$w0rd!#%", "Text entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(specialChars);

        TestScenario unicodeInput = new TestScenario(
                uid(), "Unicode Characters in Input",
                "Verify handling of unicode/emoji characters",
                ScenarioType.BOUNDARY);
        unicodeInput.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter unicode username: \u7528\u6237\u540D\u6D4B\u8BD5", "Text entered"),
                new TestStep(3, "TYPE", "Enter unicode password: \u5BC6\u7801\u6D4B\u8BD5", "Text entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(unicodeInput);

        TestScenario whitespaceOnly = new TestScenario(
                uid(), "Whitespace-Only Input",
                "Verify handling of whitespace-only credentials",
                ScenarioType.BOUNDARY);
        whitespaceOnly.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter only spaces in username", "Spaces entered"),
                new TestStep(3, "TYPE", "Enter only spaces in password", "Spaces entered"),
                new TestStep(4, "CLICK", "Click login button", "Form submitted"),
                new TestStep(5, "VERIFY_TEXT", "Check for validation error", "Error or rejection"),
                new TestStep(6, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(whitespaceOnly);

        return scenarios;
    }

    private List<TestScenario> edgeCaseScenarios(String targetUrl) {
        List<TestScenario> scenarios = new ArrayList<>();

        TestScenario doubleClick = new TestScenario(
                uid(), "Double Click Submit",
                "Verify behavior when submit button is double-clicked rapidly",
                ScenarioType.EDGE_CASE);
        doubleClick.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter valid username", "Username entered"),
                new TestStep(3, "TYPE", "Enter valid password", "Password entered"),
                new TestStep(4, "DOUBLE_CLICK", "Double-click login button rapidly", "Handled without duplicate submission"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(doubleClick);

        TestScenario backButton = new TestScenario(
                uid(), "Back Button After Login",
                "Verify back button behavior after successful login",
                ScenarioType.EDGE_CASE);
        backButton.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter valid username", "Username entered"),
                new TestStep(3, "TYPE", "Enter valid password", "Password entered"),
                new TestStep(4, "CLICK", "Click login button", "Logged in"),
                new TestStep(5, "WAIT_NAVIGATION", "Wait for redirect", "On dashboard"),
                new TestStep(6, "GO_BACK", "Click browser back button", "Navigated back"),
                new TestStep(7, "VERIFY_URL", "Check current page", "Should not return to login form or should redirect"),
                new TestStep(8, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(backButton);

        TestScenario enterKeySubmit = new TestScenario(
                uid(), "Submit via Enter Key",
                "Verify form can be submitted using Enter key",
                ScenarioType.EDGE_CASE);
        enterKeySubmit.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "TYPE", "Enter valid username", "Username entered"),
                new TestStep(3, "TYPE", "Enter valid password", "Password entered"),
                new TestStep(4, "PRESS_KEY", "Press Enter key", "Form submitted via Enter"),
                new TestStep(5, "SCREENSHOT", "Capture result", "Screenshot captured")
        ));
        scenarios.add(enterKeySubmit);

        TestScenario tabNavigation = new TestScenario(
                uid(), "Tab Key Navigation",
                "Verify form fields are navigable via Tab key",
                ScenarioType.EDGE_CASE);
        tabNavigation.setSteps(List.of(
                new TestStep(1, "NAVIGATE", "Navigate to " + targetUrl, "Page loads"),
                new TestStep(2, "PRESS_KEY", "Tab to username field", "Username field focused"),
                new TestStep(3, "TYPE", "Type username", "Text entered"),
                new TestStep(4, "PRESS_KEY", "Tab to password field", "Password field focused"),
                new TestStep(5, "TYPE", "Type password", "Text entered"),
                new TestStep(6, "PRESS_KEY", "Tab to submit button", "Button focused"),
                new TestStep(7, "SCREENSHOT", "Capture focused state", "Screenshot captured")
        ));
        scenarios.add(tabNavigation);

        return scenarios;
    }

    private String uid() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
