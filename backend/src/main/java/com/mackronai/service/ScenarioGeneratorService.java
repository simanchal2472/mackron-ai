package com.mackronai.service;

import com.mackronai.model.PageElement;
import com.mackronai.model.TestRequest;
import com.mackronai.model.TestScenario;
import com.mackronai.patterns.TestPatternProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScenarioGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(ScenarioGeneratorService.class);

    private final List<TestPatternProvider> patternProviders;
    private final PlaywrightRunnerService playwrightRunner;
    private final LlmService llmService;

    public ScenarioGeneratorService(List<TestPatternProvider> patternProviders,
                                     PlaywrightRunnerService playwrightRunner,
                                     LlmService llmService) {
        this.patternProviders = patternProviders;
        this.playwrightRunner = playwrightRunner;
        this.llmService = llmService;
    }

    public List<TestScenario> generateScenarios(TestRequest request) {
        log.info("Generating scenarios for feature '{}' at URL '{}'",
                request.getFeatureName(), request.getUrl());

        List<PageElement> elements = playwrightRunner.crawlPageElements(request.getUrl());
        log.info("Crawled {} page elements from {}", elements.size(), request.getUrl());

        List<TestScenario> scenarios = new ArrayList<>();

        String featureLower = request.getFeatureName().toLowerCase();
        boolean matched = false;

        for (TestPatternProvider provider : patternProviders) {
            if (featureLower.contains(provider.getFeatureKeyword())) {
                scenarios.addAll(provider.generateScenarios(request.getUrl(), elements));
                matched = true;
                log.info("Matched pattern provider '{}', generated {} scenarios",
                        provider.getFeatureKeyword(), scenarios.size());
            }
        }

        if (!matched) {
            log.info("No exact pattern match for '{}', using best-effort matching", featureLower);
            for (TestPatternProvider provider : patternProviders) {
                scenarios.addAll(provider.generateScenarios(request.getUrl(), elements));
            }
        }

        if (request.isLlmEnabled() && request.getLlmApiKey() != null) {
            log.info("LLM enhancement enabled, generating additional scenarios...");
            List<TestScenario> llmScenarios = llmService.generateAdditionalScenarios(
                    request.getFeatureName(), request.getUrl(),
                    elements, request.getLlmApiKey(), request.getLlmProvider());
            scenarios.addAll(llmScenarios);
            log.info("LLM generated {} additional scenarios", llmScenarios.size());
        }

        log.info("Total scenarios generated: {}", scenarios.size());
        return scenarios;
    }
}
