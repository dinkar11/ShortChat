package com.example.chat.controller;

import com.example.chat.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/users/search")
    public List<Map<String, String>> searchUsers(@RequestParam(value = "q", required = false) String query,
                                                 HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return authService.searchUsers(query, currentUser != null ? currentUser : "");
    }

    @GetMapping("/users/{username}")
    public Map<String, Object> getUserProfile(@PathVariable String username) {
        return authService.getUserProfile(username);
    }

    @GetMapping("/profile")
    public Map<String, Object> getMyProfile(HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return authService.getUserProfile(currentUser);
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        String bio = body.getOrDefault("bio", "");
        return authService.updateBio(currentUser, bio);
    }
}

