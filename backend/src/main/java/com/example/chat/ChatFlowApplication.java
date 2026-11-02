package com.example.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class ChatFlowApplication {

    private static final Logger log = LoggerFactory.getLogger(ChatFlowApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(ChatFlowApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] candidates = new Path[]{
                Path.of("backend", ".env"),
                Path.of(".env"),
                Path.of("..", ".env"),
                Path.of("..", "backend", ".env")
        };

        for (Path path : candidates) {
            if (Files.exists(path)) {
                try {
                    Files.lines(path).forEach(line -> {
                        String trimmed = line.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                            int idx = trimmed.indexOf('=');
                            String key = trimmed.substring(0, idx).trim();
                            String value = trimmed.substring(idx + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                            if ("MONGODB_URI".equals(key)) {
                                System.setProperty("spring.mongodb.uri", value);
                                System.setProperty("spring.data.mongodb.uri", value);
                            }
                        }
                    });
                    log.info("Loaded environment variables from {}", path.toAbsolutePath());
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
