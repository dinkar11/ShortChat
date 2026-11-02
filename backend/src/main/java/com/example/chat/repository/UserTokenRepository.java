package com.example.chat.repository;

import com.example.chat.model.UserToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserTokenRepository extends MongoRepository<UserToken, String> {
    Optional<UserToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteByUsername(String username);
}

