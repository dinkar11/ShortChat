package com.example.chat.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chat_sessions")
@CompoundIndex(name = "user_pair_idx", def = "{'userA': 1, 'userB': 1}")
public class ChatSession {

    @Id
    private String id;

    @Indexed
    private String userA;

    @Indexed
    private String userB;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public ChatSession() {}

    public ChatSession(String id, String userA, String userB) {
        this.id = id;
        this.userA = userA;
        this.userB = userB;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserA() { return userA; }
    public void setUserA(String userA) { this.userA = userA; }

    public String getUserB() { return userB; }
    public void setUserB(String userB) { this.userB = userB; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public boolean hasParticipant(String username) {
        return username != null && (username.equals(userA) || username.equals(userB));
    }
}

