package com.example.chat.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
public class RootController {

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/")
    public ResponseEntity<Void> root() {
        // Automatically redirects browser visits to the configured frontend URL
        return ResponseEntity.status(302).location(URI.create(frontendUrl)).build();
    }

    @GetMapping("/api")
    public Map<String, Object> apiInfo() {
        return Map.of(
                "name", "ShortChat Backend API",
                "status", "RUNNING",
                "frontendUrl", frontendUrl
        );
    }
}
