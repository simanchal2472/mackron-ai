# Handling Custom Features Beyond Predefined Patterns

Mackron AI currently has 6 predefined feature patterns (**Login**, **Form**, **CRUD**, **Navigation**, **Validation**, **Search**), but real-world applications have many more features. Here's how you can handle that.

---

## Option 1: Map to Existing Patterns

Many features map to one or more of the existing patterns. Think about what your feature does at the UI level:

| Your Feature | Map It To | Why |
|---|---|---|
| Sign Up / Registration | Form | It's a form with validation |
| Checkout / Payment | Form + Validation | Form fields with strict validation rules |
| Profile Settings | CRUD Operations | Create/read/update user data |
| Dashboard / Homepage | Navigation | Links, page loads, routing |
| Filter / Sort | Search | Query-based interaction |
| Comments / Reviews | CRUD Operations | Create/read/update/delete content |
| File Upload | Form + Validation | Input with boundary constraints |
| Password Reset | Form + Login | Form submission + auth flow |

Select the closest match from the dropdown, and Mackron AI will generate relevant scenarios.

---

## Option 2: Enable LLM Enhancement

This is the most powerful approach for custom features. When configuring a test:

1. Toggle **"Enable LLM-powered test generation"** ON
2. Provide your OpenAI or Claude API key
3. In the feature name field, describe your feature

The LLM will analyze the page's actual DOM elements (inputs, buttons, dropdowns, etc.) and generate custom test scenarios tailored to what it finds on the page. This works for **any feature**, not just the predefined ones.

---

## Option 3: Fallback Behavior (Built In)

If the feature name you enter doesn't match any keyword (`login`, `form`, `crud`, `navigation`, `validation`, `search`), Mackron AI already has a fallback behavior -- it runs **ALL pattern libraries** against the page. This gives you broad coverage across all test types.

This logic lives in the `ScenarioGeneratorService`:

```java
if (!matched) {
    // No exact pattern match, use best-effort: run all patterns
    for (TestPatternProvider provider : patternProviders) {
        scenarios.addAll(provider.generateScenarios(request.getUrl(), elements));
    }
}
```

---

## Option 4 (Recommended): Add Custom Pattern Providers

For features specific to your app, create new pattern providers. For example, a **File Upload** feature would have a `FileUploadTestPatterns.java` implementing `TestPatternProvider` with scenarios like:

- **Positive**: Upload valid file types (JPG, PDF), correct file size
- **Negative**: Upload unsupported format, empty file, exceeding size limit
- **Boundary**: File name with special characters, very long file name, zero-byte file
- **Edge Case**: Upload during network throttle, cancel mid-upload, double-click upload button

The pattern provider interface is simple:

```java
public interface TestPatternProvider {
    String getFeatureKeyword();  // e.g., "upload"
    List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements);
}
```

Any class implementing this interface and annotated with `@Component` is automatically picked up by Spring's dependency injection -- no wiring needed.

---

## Recommendation Summary

| Approach | When to Use |
|---|---|
| Map to existing pattern | Your feature is similar to login/form/CRUD/navigation/validation/search |
| Enable LLM | You want intelligent, custom test cases without writing code |
| Type any name (fallback) | You want broad coverage with all patterns at once |
| Add custom pattern provider | You have app-specific features you test repeatedly |

To create custom pattern providers for your specific features, describe which features your application has and tailored test scenarios will be built for each one.
