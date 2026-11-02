package com.example.chat.service;

import com.example.chat.dto.MessageRequest;
import com.example.chat.model.ChatSession;
import com.example.chat.model.Message;
import com.example.chat.repository.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final SessionService sessionService;

    public MessageService(MessageRepository messageRepository, SessionService sessionService) {
        this.messageRepository = messageRepository;
        this.sessionService = sessionService;
    }

    public List<Message> getConversation(String userA, String userB, String authenticatedUser) {
        String sessionId = ConversationIdUtil.of(userA, userB);
        return sessionService.getSessionMessages(sessionId, authenticatedUser);
    }

    public Message send(MessageRequest request, String authenticatedUser) {
        if (!request.getSenderId().equalsIgnoreCase(authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sender must match authenticated user");
        }

        ChatSession session;
        if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            session = sessionService.getSessionWithAuth(request.getSessionId(), authenticatedUser);
        } else {
            session = sessionService.getOrCreateSession(request.getSenderId(), request.getReceiverId());
        }

        return sessionService.sendMessage(session.getId(), request.getContent(), authenticatedUser);
    }

    public long deleteConversation(String userA, String userB, String authenticatedUser) {
        String sessionId = ConversationIdUtil.of(userA, userB);
        return sessionService.deleteSession(sessionId, authenticatedUser);
    }
}
