package com.mackronai.controller;

import com.mackronai.model.TestReport;
import com.mackronai.service.TestEngineService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tests")
public class ReportController {

    private final TestEngineService testEngine;

    public ReportController(TestEngineService testEngine) {
        this.testEngine = testEngine;
    }

    @GetMapping("/{testId}/report")
    public ResponseEntity<TestReport> getReport(@PathVariable String testId) {
        TestReport report = testEngine.getReport(testId);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(report);
    }

    @GetMapping(value = "/{testId}/report/html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getHtmlReport(@PathVariable String testId) {
        String html = testEngine.getHtmlReport(testId);
        if (html == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(html);
    }
}
