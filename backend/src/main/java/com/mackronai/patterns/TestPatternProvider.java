package com.mackronai.patterns;

import com.mackronai.model.PageElement;
import com.mackronai.model.TestScenario;

import java.util.List;

public interface TestPatternProvider {

    String getFeatureKeyword();

    List<TestScenario> generateScenarios(String targetUrl, List<PageElement> elements);
}
