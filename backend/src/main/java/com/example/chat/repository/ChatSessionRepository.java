package com.example.chat.repository;

import com.example.chat.model.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {
    List<ChatSession> findByUserAOrUserBOrderByUpdatedAtDesc(String userA, String userB);
}

