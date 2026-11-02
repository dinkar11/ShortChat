package com.example.chat.repository;

import com.example.chat.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByAuthorUsernameOrderByCreatedAtDesc(String authorUsername);
}

