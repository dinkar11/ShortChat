package com.example.chat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Void> root() {
        // Automatically redirects browser visits from port 8080 to the React frontend on port 5173
        return ResponseEntity.status(302).location(URI.create("http://localhost:5173")).build();
    }

    @GetMapping("/api")
    public Map<String, Object> apiInfo() {
        return Map.of(
                "name", "ShortChat Backend API",
                "status", "RUNNING",
                "frontendUrl", "http://localhost:5173"
        );
    }
}

