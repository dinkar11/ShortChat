package com.example.chat.controller;

import com.example.chat.dto.CreateSessionRequest;
import com.example.chat.dto.SendMessageRequest;
import com.example.chat.model.ChatSession;
import com.example.chat.model.Message;
import com.example.chat.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<ChatSession> getMySessions(HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return sessionService.getUserSessions(currentUser);
    }

    @PostMapping
    public ChatSession createOrGetSession(@Valid @RequestBody CreateSessionRequest body, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return sessionService.getOrCreateSession(currentUser, body.getOtherUser().trim().toLowerCase());
    }

    @GetMapping("/{sessionId}/messages")
    public List<Message> getSessionMessages(@PathVariable String sessionId, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return sessionService.getSessionMessages(sessionId, currentUser);
    }

    @PostMapping("/{sessionId}/messages")
    public Message sendMessageToSession(@PathVariable String sessionId,
                                        @Valid @RequestBody SendMessageRequest body,
                                        HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return sessionService.sendMessage(sessionId, body.getContent(), currentUser);
    }

    @DeleteMapping("/{sessionId}")
    public Map<String, Object> deleteSession(@PathVariable String sessionId, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        long deletedCount = sessionService.deleteSession(sessionId, currentUser);
        return Map.of("sessionId", sessionId, "deletedMessages", deletedCount);
    }
}

