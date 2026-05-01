package com.mackronai.controller;

import com.mackronai.model.TestRequest;
import com.mackronai.service.TestEngineService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestEngineService testEngine;

    public TestController(TestEngineService testEngine) {
        this.testEngine = testEngine;
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, String>> executeTest(@Valid @RequestBody TestRequest request) {
        String testId = testEngine.submitTest(request);
        return ResponseEntity.ok(Map.of("testId", testId, "status", "STARTED"));
    }

    @GetMapping(value = "/{testId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamTestProgress(@PathVariable String testId) {
        return testEngine.createEmitter(testId);
    }

    @GetMapping("/{testId}/status")
    public ResponseEntity<Map<String, String>> getTestStatus(@PathVariable String testId) {
        return ResponseEntity.ok(testEngine.getStatus(testId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, String>>> getTestHistory() {
        return ResponseEntity.ok(testEngine.getHistory());
    }
}
