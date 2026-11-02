package com.example.chat.controller;

import com.example.chat.dto.PostRequest;
import com.example.chat.model.Post;
import com.example.chat.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/user/{username}")
    public List<Post> getUserPosts(@PathVariable String username) {
        return postService.getPostsByUsername(username);
    }

    @PostMapping
    public Post createPost(@Valid @RequestBody PostRequest body, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return postService.createPost(body.getContent(), currentUser);
    }

    @PostMapping("/{id}/like")
    public Post toggleLike(@PathVariable String id, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return postService.toggleLike(id, currentUser);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deletePost(@PathVariable String id, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        postService.deletePost(id, currentUser);
        return Map.of("id", id, "deleted", true);
    }
}

