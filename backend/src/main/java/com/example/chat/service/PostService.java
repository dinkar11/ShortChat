package com.example.chat.service;

import com.example.chat.model.Post;
import com.example.chat.model.User;
import com.example.chat.repository.PostRepository;
import com.example.chat.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByUsername(String username) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username);
    }

    public Post createPost(String content, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = new Post(username, user.getEmail(), content.trim());
        return postRepository.save(post);
    }

    public Post toggleLike(String postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        List<String> likedBy = post.getLikedBy();
        if (likedBy.contains(username)) {
            likedBy.remove(username);
        } else {
            likedBy.add(username);
        }
        post.setLikedBy(likedBy);
        return postRepository.save(post);
    }

    public void deletePost(String postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getAuthorUsername().equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }
}

