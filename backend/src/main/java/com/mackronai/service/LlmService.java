package com.mackronai.service;

import com.mackronai.model.PageElement;
import com.mackronai.model.TestScenario;
import com.mackronai.model.TestStep;
import com.mackronai.model.enums.ScenarioType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class LlmService {

    private static final Logger log = LoggerFactory.getLogger(LlmService.class);

    @Value("${mackron.llm.openai-url}")
    private String openaiUrl;

    @Value("${mackron.llm.claude-url}")
    private String claudeUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<TestScenario> generateAdditionalScenarios(
            String featureName, String targetUrl,
            List<PageElement> elements, String apiKey, String provider) {

        if (apiKey == null || apiKey.isBlank()) {
            log.info("No LLM API key provided, skipping LLM-enhanced scenario generation");
            return Collections.emptyList();
        }

        try {
            String prompt = buildPrompt(featureName, targetUrl, elements);
            String response = callLlm(prompt, apiKey, provider);
            return parseLlmResponse(response);
        } catch (Exception e) {
            log.error("LLM scenario generation failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private String buildPrompt(String featureName, String targetUrl, List<PageElement> elements) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a QA testing expert. Generate additional test scenarios for the '")
          .append(featureName)
          .append("' feature at URL: ").append(targetUrl).append("\n\n");

        sb.append("Page elements found:\n");
        for (PageElement el : elements) {
            sb.append("- ").append(el.getTagName());
            if (el.getType() != null) sb.append(" type=").append(el.getType());
            if (el.getName() != null) sb.append(" name=").append(el.getName());
            if (el.getId() != null) sb.append(" id=").append(el.getId());
            if (el.isRequired()) sb.append(" [REQUIRED]");
            sb.append("\n");
        }

        sb.append("\nGenerate 3-5 creative test scenarios in JSON format:\n");
        sb.append("[{\"name\": \"...\", \"description\": \"...\", \"type\": \"POSITIVE|NEGATIVE|BOUNDARY|EDGE_CASE\", ");
        sb.append("\"steps\": [{\"action\": \"...\", \"description\": \"...\", \"expected\": \"...\"}]}]\n");
        sb.append("Focus on scenarios NOT covered by standard login/form/CRUD patterns.");

        return sb.toString();
    }

    private String callLlm(String prompt, String apiKey, String provider) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if ("claude".equalsIgnoreCase(provider)) {
            return callClaude(prompt, apiKey, headers);
        }
        return callOpenAi(prompt, apiKey, headers);
    }

    private String callOpenAi(String prompt, String apiKey, HttpHeaders headers) {
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 2000,
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(openaiUrl, HttpMethod.POST, request, String.class);
        return extractOpenAiContent(response.getBody());
    }

    private String callClaude(String prompt, String apiKey, HttpHeaders headers) {
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 2000,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(claudeUrl, HttpMethod.POST, request, String.class);
        return extractClaudeContent(response.getBody());
    }

    private String extractOpenAiContent(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("choices").path(0).path("message").path("content").asText();
        } catch (Exception e) {
            return "";
        }
    }

    private String extractClaudeContent(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("content").path(0).path("text").asText();
        } catch (Exception e) {
            return "";
        }
    }

    private List<TestScenario> parseLlmResponse(String response) {
        List<TestScenario> scenarios = new ArrayList<>();
        try {
            int jsonStart = response.indexOf('[');
            int jsonEnd = response.lastIndexOf(']');
            if (jsonStart < 0 || jsonEnd < 0) return scenarios;

            String jsonArray = response.substring(jsonStart, jsonEnd + 1);
            JsonNode arrayNode = objectMapper.readTree(jsonArray);

            for (JsonNode node : arrayNode) {
                TestScenario scenario = new TestScenario();
                scenario.setId(UUID.randomUUID().toString().substring(0, 8));
                scenario.setName(node.path("name").asText("LLM Generated Test"));
                scenario.setDescription(node.path("description").asText(""));

                String typeStr = node.path("type").asText("POSITIVE");
                scenario.setScenarioType(parseScenarioType(typeStr));

                List<TestStep> steps = new ArrayList<>();
                JsonNode stepsNode = node.path("steps");
                int stepNum = 1;
                for (JsonNode stepNode : stepsNode) {
                    TestStep step = new TestStep(
                            stepNum++,
                            stepNode.path("action").asText("VERIFY_TEXT"),
                            stepNode.path("description").asText(""),
                            stepNode.path("expected").asText("")
                    );
                    steps.add(step);
                }
                if (!steps.isEmpty()) {
                    scenario.setSteps(steps);
                    scenarios.add(scenario);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse LLM response: {}", e.getMessage());
        }
        return scenarios;
    }

    private ScenarioType parseScenarioType(String type) {
        return switch (type.toUpperCase()) {
            case "NEGATIVE" -> ScenarioType.NEGATIVE;
            case "BOUNDARY" -> ScenarioType.BOUNDARY;
            case "EDGE_CASE", "EDGE" -> ScenarioType.EDGE_CASE;
            default -> ScenarioType.POSITIVE;
        };
    }
}
