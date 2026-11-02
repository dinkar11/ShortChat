package com.example.chat.service;

import com.example.chat.model.ChatSession;
import com.example.chat.model.Message;
import com.example.chat.repository.ChatSessionRepository;
import com.example.chat.repository.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class SessionService {

    private final ChatSessionRepository sessionRepository;
    private final MessageRepository messageRepository;

    public SessionService(ChatSessionRepository sessionRepository, MessageRepository messageRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
    }

    public List<ChatSession> getUserSessions(String username) {
        return sessionRepository.findByUserAOrUserBOrderByUpdatedAtDesc(username, username);
    }

    public ChatSession getOrCreateSession(String userA, String userB) {
        if (userA.equalsIgnoreCase(userB)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot start a session with yourself");
        }
        String sessionId = ConversationIdUtil.of(userA, userB);
        return sessionRepository.findById(sessionId).orElseGet(() -> {
            String lowerA = userA.compareTo(userB) <= 0 ? userA : userB;
            String lowerB = userA.compareTo(userB) <= 0 ? userB : userA;
            ChatSession session = new ChatSession(sessionId, lowerA, lowerB);
            return sessionRepository.save(session);
        });
    }

    public ChatSession getSessionWithAuth(String sessionId, String authenticatedUser) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));

        if (!session.hasParticipant(authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: You are not a participant in this session");
        }
        return session;
    }

    public List<Message> getSessionMessages(String sessionId, String authenticatedUser) {
        // Enforce authorization
        getSessionWithAuth(sessionId, authenticatedUser);

        List<Message> recent = messageRepository.findTop50BySessionIdOrderBySentAtDesc(sessionId);
        if (recent.isEmpty()) {
            // Fallback for conversationId if migrated
            recent = messageRepository.findTop50ByConversationIdOrderBySentAtDesc(sessionId);
        }

        List<Message> ordered = new ArrayList<>(recent);
        Collections.reverse(ordered);
        return ordered;
    }

    public Message sendMessage(String sessionId, String content, String senderId) {
        ChatSession session = getSessionWithAuth(sessionId, senderId);

        String receiverId = session.getUserA().equalsIgnoreCase(senderId) ? session.getUserB() : session.getUserA();

        Message message = new Message();
        message.setSessionId(sessionId);
        message.setConversationId(sessionId);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setSentAt(Instant.now());

        Message saved = messageRepository.save(message);

        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        return saved;
    }

    public long deleteSession(String sessionId, String authenticatedUser) {
        ChatSession session = getSessionWithAuth(sessionId, authenticatedUser);

        long deletedMessages = messageRepository.deleteBySessionId(sessionId);
        deletedMessages += messageRepository.deleteByConversationId(sessionId);
        sessionRepository.delete(session);

        return deletedMessages;
    }
}

