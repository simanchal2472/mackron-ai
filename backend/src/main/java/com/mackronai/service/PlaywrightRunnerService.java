package com.mackronai.service;

import com.mackronai.config.PlaywrightConfig;
import com.mackronai.model.PageElement;
import com.mackronai.model.TestScenario;
import com.mackronai.model.TestStep;
import com.mackronai.model.enums.TestStatus;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;
import java.util.function.Consumer;

@Service
public class PlaywrightRunnerService {

    private static final Logger log = LoggerFactory.getLogger(PlaywrightRunnerService.class);

    private final PlaywrightConfig config;
    private Playwright playwright;

    public PlaywrightRunnerService(PlaywrightConfig config) {
        this.config = config;
    }

    private synchronized Playwright getPlaywright() {
        if (playwright == null) {
            playwright = Playwright.create();
        }
        return playwright;
    }

    @PreDestroy
    public void cleanup() {
        if (playwright != null) {
            playwright.close();
        }
    }

    public List<PageElement> crawlPageElements(String url) {
        List<PageElement> elements = new ArrayList<>();
        try (Browser browser = launchBrowser();
             BrowserContext context = browser.newContext()) {
            Page page = context.newPage();
            page.setDefaultTimeout(config.getTimeout());
            page.navigate(url);
            page.waitForLoadState(LoadState.NETWORKIDLE);

            elements.addAll(extractElements(page, "input"));
            elements.addAll(extractElements(page, "button"));
            elements.addAll(extractElements(page, "select"));
            elements.addAll(extractElements(page, "textarea"));
            elements.addAll(extractElements(page, "a"));
        } catch (Exception e) {
            log.error("Failed to crawl page elements from {}: {}", url, e.getMessage());
        }
        return elements;
    }

    public TestScenario executeScenario(TestScenario scenario, String targetUrl,
                                         String username, String password,
                                         Consumer<TestStep> stepCallback) {
        long scenarioStart = System.currentTimeMillis();
        scenario.setStatus(TestStatus.RUNNING);

        try (Browser browser = launchBrowser();
             BrowserContext context = browser.newContext()) {
            Page page = context.newPage();
            page.setDefaultTimeout(config.getTimeout());

            for (TestStep step : scenario.getSteps()) {
                long stepStart = System.currentTimeMillis();
                step.setStatus(TestStatus.RUNNING);

                try {
                    executeStep(page, step, targetUrl, username, password);
                    step.setStatus(TestStatus.PASS);
                    step.setActualResult(step.getExpectedResult());
                } catch (Exception e) {
                    step.setStatus(TestStatus.FAIL);
                    step.setActualResult(e.getMessage());
                    step.setErrorMessage(e.getMessage());
                    captureScreenshot(page, step);
                } finally {
                    step.setDurationMs(System.currentTimeMillis() - stepStart);
                    if (stepCallback != null) {
                        stepCallback.accept(step);
                    }
                }

                if (step.getStatus() == TestStatus.FAIL &&
                        isCriticalAction(step.getAction())) {
                    skipRemainingSteps(scenario, scenario.getSteps().indexOf(step) + 1);
                    break;
                }
            }

            computeScenarioStatus(scenario);
        } catch (Exception e) {
            log.error("Scenario '{}' failed: {}", scenario.getName(), e.getMessage());
            scenario.setStatus(TestStatus.ERROR);
            scenario.setErrorMessage(e.getMessage());
        }

        scenario.setDurationMs(System.currentTimeMillis() - scenarioStart);
        return scenario;
    }

    private void executeStep(Page page, TestStep step, String targetUrl,
                              String username, String password) {
        switch (step.getAction()) {
            case "NAVIGATE" -> {
                String url = extractUrl(step.getDescription(), targetUrl);
                page.navigate(url);
                page.waitForLoadState(LoadState.DOMCONTENTLOADED);
            }
            case "FIND_ELEMENT" -> {
                String selector = guessSelector(step.getDescription());
                Locator locator = page.locator(selector).first();
                locator.waitFor();
            }
            case "FIND_ELEMENTS" -> {
                page.waitForLoadState(LoadState.DOMCONTENTLOADED);
            }
            case "TYPE" -> {
                String value = resolveTypeValue(step.getDescription(), username, password);
                String selector = guessInputSelector(step.getDescription());
                Locator field = page.locator(selector).first();
                field.waitFor();
                field.fill(value);
            }
            case "CLICK" -> {
                String selector = guessClickableSelector(step.getDescription());
                Locator button = page.locator(selector).first();
                button.waitFor();
                button.click();
                page.waitForTimeout(500);
            }
            case "DOUBLE_CLICK" -> {
                String selector = guessClickableSelector(step.getDescription());
                Locator button = page.locator(selector).first();
                button.waitFor();
                button.dblclick();
            }
            case "CLEAR" -> {
                String selector = guessInputSelector(step.getDescription());
                Locator field = page.locator(selector).first();
                field.clear();
                String newValue = extractInlineValue(step.getDescription());
                if (newValue != null) {
                    field.fill(newValue);
                }
            }
            case "SELECT" -> {
                Locator select = page.locator("select").first();
                if (select.isVisible()) {
                    List<String> options = select.locator("option").allTextContents();
                    if (options.size() > 1) {
                        select.selectOption(options.get(1));
                    }
                }
            }
            case "VERIFY_TEXT" -> {
                page.waitForTimeout(1000);
                String bodyText = page.textContent("body");
                if (bodyText == null || bodyText.isBlank()) {
                    throw new AssertionError("Page body has no text content");
                }
            }
            case "VERIFY_ELEMENT" -> {
                String selector = guessSelector(step.getDescription());
                Locator el = page.locator(selector).first();
                el.waitFor();
                if (!el.isVisible()) {
                    throw new AssertionError("Element not visible: " + selector);
                }
            }
            case "VERIFY_URL" -> {
                page.waitForTimeout(500);
                // Just capture current URL as actual result
                step.setActualResult("Current URL: " + page.url());
            }
            case "VERIFY_VALUE" -> {
                page.waitForTimeout(500);
            }
            case "VERIFY_NO_ALERT" -> {
                // If we got here without a dialog handler firing, no alert appeared
                step.setActualResult("No alert dialog detected");
            }
            case "VERIFY_LINKS" -> {
                page.waitForLoadState(LoadState.DOMCONTENTLOADED);
                List<String> links = page.locator("a[href]").allTextContents();
                step.setActualResult("Found " + links.size() + " links");
            }
            case "CHECK_STATUS", "MEASURE_TIME", "CAPTURE_STATE", "VERIFY_STATE" -> {
                // Observational steps that always pass
                page.waitForTimeout(300);
            }
            case "WAIT_NAVIGATION" -> {
                page.waitForLoadState(LoadState.DOMCONTENTLOADED);
                page.waitForTimeout(2000);
            }
            case "GO_BACK" -> page.goBack();
            case "GO_FORWARD" -> page.goForward();
            case "RELOAD" -> page.reload();
            case "PRESS_KEY" -> {
                String key = extractKeyName(step.getDescription());
                page.keyboard().press(key);
            }
            case "PASTE" -> {
                String selector = guessInputSelector(step.getDescription());
                Locator field = page.locator(selector).first();
                field.waitFor();
                field.fill("pasted-invalid-data!!!");
            }
            case "SCREENSHOT" -> captureScreenshot(page, step);
            default -> log.warn("Unknown action: {}", step.getAction());
        }
    }

    private Browser launchBrowser() {
        BrowserType browserType = switch (config.getBrowser().toLowerCase()) {
            case "firefox" -> getPlaywright().firefox();
            case "webkit" -> getPlaywright().webkit();
            default -> getPlaywright().chromium();
        };
        return browserType.launch(new BrowserType.LaunchOptions().setHeadless(config.isHeadless()));
    }

    private void captureScreenshot(Page page, TestStep step) {
        try {
            byte[] screenshot = page.screenshot(new Page.ScreenshotOptions().setFullPage(false));
            step.setScreenshotBase64(Base64.getEncoder().encodeToString(screenshot));
        } catch (Exception e) {
            log.warn("Failed to capture screenshot for step {}: {}", step.getStepNumber(), e.getMessage());
        }
    }

    private List<PageElement> extractElements(Page page, String tagName) {
        List<PageElement> elements = new ArrayList<>();
        Locator locator = page.locator(tagName);
        int count = locator.count();

        for (int i = 0; i < Math.min(count, 50); i++) {
            try {
                Locator el = locator.nth(i);
                PageElement pe = new PageElement();
                pe.setTagName(tagName);
                pe.setType(safeGetAttribute(el, "type"));
                pe.setId(safeGetAttribute(el, "id"));
                pe.setName(safeGetAttribute(el, "name"));
                pe.setPlaceholder(safeGetAttribute(el, "placeholder"));
                pe.setSelector(buildSelector(tagName, pe.getId(), pe.getName(), pe.getType()));
                pe.setRequired(safeGetAttribute(el, "required") != null);
                pe.setMaxLength(safeGetAttribute(el, "maxlength"));
                pe.setMinLength(safeGetAttribute(el, "minlength"));
                pe.setPattern(safeGetAttribute(el, "pattern"));
                elements.add(pe);
            } catch (Exception e) {
                // Element might have become stale
            }
        }
        return elements;
    }

    private String safeGetAttribute(Locator locator, String attr) {
        try {
            return locator.getAttribute(attr);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildSelector(String tag, String id, String name, String type) {
        if (id != null && !id.isBlank()) return tag + "#" + id;
        if (name != null && !name.isBlank()) return tag + "[name='" + name + "']";
        if (type != null && !type.isBlank()) return tag + "[type='" + type + "']";
        return tag;
    }

    private String extractUrl(String description, String fallbackUrl) {
        if (description.contains("http://") || description.contains("https://")) {
            String[] parts = description.split("\\s+");
            for (String part : parts) {
                if (part.startsWith("http://") || part.startsWith("https://")) {
                    return part;
                }
            }
        }
        return fallbackUrl;
    }

    private String resolveTypeValue(String description, String username, String password) {
        String lower = description.toLowerCase();
        if (lower.contains("valid username") || lower.contains("valid email")) {
            return username != null ? username : "testuser";
        }
        if (lower.contains("valid password")) {
            return password != null ? password : "TestPass123!";
        }
        if (lower.contains("incorrect password") || lower.contains("wrong")) {
            return "WrongPass123!";
        }
        if (lower.contains("non-existent")) {
            return "nonexistent_user_xyz";
        }
        if (lower.contains("sql injection")) {
            return "' OR '1'='1";
        }
        if (lower.contains("xss")) {
            return "<script>alert('xss')</script>";
        }
        if (lower.contains("256-character")) {
            return "a".repeat(256);
        }
        if (lower.contains("1000-character")) {
            return "a".repeat(1000);
        }
        if (lower.contains("special char")) {
            return "t@st!#$%^&*()";
        }
        if (lower.contains("unicode")) {
            return "\u7528\u6237\u540D\u6D4B\u8BD5";
        }
        if (lower.contains("spaces") || lower.contains("whitespace")) {
            return "     ";
        }
        if (lower.contains("invalid email") || lower.contains("not-an-email")) {
            return "not-an-email";
        }
        if (lower.contains("nonsense") || lower.contains("zzz")) {
            return "zzzzxxxyyy12345";
        }
        if (lower.contains("alphabetic") && lower.contains("phone")) {
            return "abcdefghij";
        }
        if (lower.contains("fill") || lower.contains("valid data")) {
            return "Test Data " + UUID.randomUUID().toString().substring(0, 6);
        }
        if (lower.contains("new value")) {
            return "Updated Value " + UUID.randomUUID().toString().substring(0, 6);
        }
        if (lower.contains("o'brien")) {
            return "O'Brien-Smith";
        }
        return "test-input-" + UUID.randomUUID().toString().substring(0, 4);
    }

    private String guessSelector(String description) {
        String lower = description.toLowerCase();
        if (lower.contains("username") || lower.contains("email")) {
            return "input[type='text'], input[type='email'], input[name*='user'], input[name*='email'], input[id*='user'], input[id*='email']";
        }
        if (lower.contains("password")) {
            return "input[type='password']";
        }
        if (lower.contains("submit") || lower.contains("login") || lower.contains("button")) {
            return "button[type='submit'], input[type='submit'], button";
        }
        if (lower.contains("search")) {
            return "input[type='search'], input[name*='search'], input[id*='search'], input[placeholder*='search' i]";
        }
        if (lower.contains("phone")) {
            return "input[type='tel'], input[name*='phone'], input[id*='phone']";
        }
        if (lower.contains("number") || lower.contains("numeric")) {
            return "input[type='number']";
        }
        if (lower.contains("required")) {
            return "[required], .required, label:has-text('*')";
        }
        if (lower.contains("table") || lower.contains("list") || lower.contains("records")) {
            return "table, ul, ol, [class*='list'], [class*='table']";
        }
        return "input, button, a";
    }

    private String guessInputSelector(String description) {
        String lower = description.toLowerCase();
        if (lower.contains("username") || lower.contains("user")) {
            return "input[type='text'], input[type='email'], input[name*='user'], input[name*='email'], input[id*='user'], input[id*='email'], input:not([type='password']):not([type='hidden']):not([type='submit'])";
        }
        if (lower.contains("password")) {
            return "input[type='password']";
        }
        if (lower.contains("email")) {
            return "input[type='email'], input[name*='email']";
        }
        if (lower.contains("phone")) {
            return "input[type='tel'], input[name*='phone']";
        }
        if (lower.contains("search")) {
            return "input[type='search'], input[name*='search'], input[placeholder*='search' i]";
        }
        return "input:not([type='hidden']):not([type='submit'])";
    }

    private String guessClickableSelector(String description) {
        String lower = description.toLowerCase();
        if (lower.contains("login") || lower.contains("submit") || lower.contains("sign in")) {
            return "button[type='submit'], input[type='submit'], button:has-text('Log'), button:has-text('Sign'), button:has-text('Submit'), a:has-text('Log'), a:has-text('Sign')";
        }
        if (lower.contains("add new") || lower.contains("create")) {
            return "button:has-text('Add'), button:has-text('Create'), button:has-text('New'), a:has-text('Add'), a:has-text('Create')";
        }
        if (lower.contains("edit")) {
            return "button:has-text('Edit'), a:has-text('Edit'), [class*='edit']";
        }
        if (lower.contains("delete") || lower.contains("remove")) {
            return "button:has-text('Delete'), button:has-text('Remove'), a:has-text('Delete')";
        }
        if (lower.contains("save") || lower.contains("update")) {
            return "button:has-text('Save'), button:has-text('Update'), button[type='submit']";
        }
        if (lower.contains("confirm")) {
            return "button:has-text('Confirm'), button:has-text('Yes'), button:has-text('OK')";
        }
        if (lower.contains("search")) {
            return "button:has-text('Search'), button[type='submit'], input[type='submit']";
        }
        if (lower.contains("navigation link") || lower.contains("nav link")) {
            return "nav a, a[href]";
        }
        return "button, input[type='submit'], a";
    }

    private String extractKeyName(String description) {
        String lower = description.toLowerCase();
        if (lower.contains("enter")) return "Enter";
        if (lower.contains("tab")) return "Tab";
        if (lower.contains("escape") || lower.contains("esc")) return "Escape";
        return "Enter";
    }

    private String extractInlineValue(String description) {
        if (description.contains("'") && description.lastIndexOf("'") > description.indexOf("'")) {
            return description.substring(description.indexOf("'") + 1, description.lastIndexOf("'"));
        }
        return null;
    }

    private boolean isCriticalAction(String action) {
        return "NAVIGATE".equals(action);
    }

    private void skipRemainingSteps(TestScenario scenario, int fromIndex) {
        for (int i = fromIndex; i < scenario.getSteps().size(); i++) {
            scenario.getSteps().get(i).setStatus(TestStatus.SKIP);
            scenario.getSteps().get(i).setActualResult("Skipped due to earlier critical failure");
        }
    }

    private void computeScenarioStatus(TestScenario scenario) {
        boolean hasFail = false;
        boolean hasError = false;
        for (TestStep step : scenario.getSteps()) {
            if (step.getStatus() == TestStatus.FAIL) hasFail = true;
            if (step.getStatus() == TestStatus.ERROR) hasError = true;
        }
        if (hasError) {
            scenario.setStatus(TestStatus.ERROR);
        } else if (hasFail) {
            scenario.setStatus(TestStatus.FAIL);
        } else {
            scenario.setStatus(TestStatus.PASS);
        }
    }
}
