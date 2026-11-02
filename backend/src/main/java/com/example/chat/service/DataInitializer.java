package com.example.chat.service;

import com.example.chat.model.ChatSession;
import com.example.chat.model.Message;
import com.example.chat.model.Post;
import com.example.chat.model.User;
import com.example.chat.model.UserToken;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

/**
 * Initializes the MongoDB database, creates collections,
 * and ensures indexes for users, posts, and session-based messaging.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    public DataInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        initCollectionsAndIndexes();
    }

    private void initCollectionsAndIndexes() {
        // 1. Users collection
        if (!mongoTemplate.collectionExists(User.class)) {
            mongoTemplate.createCollection(User.class);
        }
        mongoTemplate.indexOps(User.class)
                .ensureIndex(new Index().on("username", Sort.Direction.ASC).unique());

        // 2. User Tokens collection
        if (!mongoTemplate.collectionExists(UserToken.class)) {
            mongoTemplate.createCollection(UserToken.class);
        }
        mongoTemplate.indexOps(UserToken.class)
                .ensureIndex(new Index().on("token", Sort.Direction.ASC).unique());
        mongoTemplate.indexOps(UserToken.class)
                .ensureIndex(new Index().on("username", Sort.Direction.ASC));

        // 3. Posts collection
        if (!mongoTemplate.collectionExists(Post.class)) {
            mongoTemplate.createCollection(Post.class);
        }
        mongoTemplate.indexOps(Post.class)
                .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        mongoTemplate.indexOps(Post.class)
                .ensureIndex(new Index().on("authorUsername", Sort.Direction.ASC));

        // 4. Chat Sessions collection
        if (!mongoTemplate.collectionExists(ChatSession.class)) {
            mongoTemplate.createCollection(ChatSession.class);
        }
        mongoTemplate.indexOps(ChatSession.class)
                .ensureIndex(new Index().on("userA", Sort.Direction.ASC).on("userB", Sort.Direction.ASC));

        // 5. Messages collection (store messages per session)
        if (!mongoTemplate.collectionExists(Message.class)) {
            mongoTemplate.createCollection(Message.class);
        }
        mongoTemplate.indexOps(Message.class)
                .ensureIndex(new Index().on("sessionId", Sort.Direction.ASC).on("sentAt", Sort.Direction.ASC));
    }
}
