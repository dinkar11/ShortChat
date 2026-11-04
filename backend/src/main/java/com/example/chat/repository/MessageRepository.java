package com.example.chat.repository;

import com.example.chat.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findTop50BySessionIdOrderBySentAtDesc(String sessionId);

    List<Message> findTop50ByConversationIdOrderBySentAtDesc(String conversationId);

    long deleteBySessionId(String sessionId);

    long deleteByConversationId(String conversationId);

    long countByReceiverIdIgnoreCaseAndStatus(String receiverId, String status);

    long countBySessionIdAndReceiverIdIgnoreCaseAndStatus(String sessionId, String receiverId, String status);

    List<Message> findBySessionIdAndReceiverIdIgnoreCaseAndStatus(String sessionId, String receiverId, String status);
}
