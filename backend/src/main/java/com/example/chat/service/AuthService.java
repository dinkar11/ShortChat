package com.example.chat.service;

import com.example.chat.dto.AuthRequest;
import com.example.chat.dto.AuthResponse;
import com.example.chat.model.User;
import com.example.chat.model.UserToken;
import com.example.chat.repository.UserRepository;
import com.example.chat.repository.UserTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;

    private static final String[] ADJECTIVES = {
        "swift", "clever", "cosmic", "silent", "brave", "bright", "shadow", "cyber",
        "golden", "mystic", "rapid", "hyper", "neon", "silver", "lunar", "solar",
        "quantum", "zenith", "vivid", "astral"
    };

    private static final String[] NOUNS = {
        "falcon", "tiger", "runner", "coder", "pilot", "phoenix", "hacker", "seeker",
        "rider", "wizard", "voyager", "pioneer", "ranger", "hunter", "scout", "ninja",
        "orbit", "spark", "echo", "nexus"
    };

    public AuthService(UserRepository userRepository, UserTokenRepository userTokenRepository) {
        this.userRepository = userRepository;
        this.userTokenRepository = userTokenRepository;
    }

    public AuthResponse register(AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An account with this email already exists");
        }

        String username;
        if (request.getUsername() != null && !request.getUsername().trim().isBlank()) {
            username = request.getUsername().trim().toLowerCase();
            if (userRepository.existsByUsername(username)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken. Please choose another.");
            }
        } else {
            username = generateRandomUsername();
        }

        User user = new User(email, username, request.getPassword());
        userRepository.save(user);

        return createSessionToken(username, email);
    }

    public AuthResponse login(AuthRequest request) {
        // Can be supplied as username, email, or identifier
        String identifier = "";
        if (request.getEmail() != null && !request.getEmail().trim().isBlank()) {
            identifier = request.getEmail().trim().toLowerCase();
        } else if (request.getUsername() != null && !request.getUsername().trim().isBlank()) {
            identifier = request.getUsername().trim().toLowerCase();
        }

        if (identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username or email is required");
        }

        User user = null;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier).orElse(null);
        }

        if (user == null) {
            user = userRepository.findByUsername(identifier).orElse(null);
        }

        if (user == null) {
            // Also check email fallback in case of no '@'
            user = userRepository.findByEmail(identifier).orElse(null);
        }

        if (user == null || !user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return createSessionToken(user.getUsername(), user.getEmail());
    }

    public Optional<String> validateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return userTokenRepository.findByToken(token).map(UserToken::getUsername);
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            userTokenRepository.deleteByToken(token);
        }
    }

    public Map<String, Object> getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "bio", user.getBio() != null ? user.getBio() : "",
                "createdAt", user.getCreatedAt().toString()
        );
    }

    public Map<String, Object> updateBio(String username, String bio) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setBio(bio != null ? bio.trim() : "");
        userRepository.save(user);

        return Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "bio", user.getBio(),
                "createdAt", user.getCreatedAt().toString()
        );
    }

    public List<Map<String, String>> searchUsers(String query, String excludeUsername) {
        if (query == null || query.trim().isBlank()) {
            return userRepository.findAll().stream()
                    .filter(u -> !u.getUsername().equalsIgnoreCase(excludeUsername))
                    .limit(10)
                    .map(u -> Map.of(
                            "username", u.getUsername(),
                            "email", u.getEmail(),
                            "bio", u.getBio() != null ? u.getBio() : ""
                    ))
                    .toList();
        }

        return userRepository.findTop20ByUsernameContainingIgnoreCase(query.trim()).stream()
                .filter(u -> !u.getUsername().equalsIgnoreCase(excludeUsername))
                .map(u -> Map.of(
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "bio", u.getBio() != null ? u.getBio() : ""
                ))
                .toList();
    }

    public String generateRandomUsername() {
        Random rand = new Random();
        for (int attempt = 0; attempt < 50; attempt++) {
            String adj = ADJECTIVES[rand.nextInt(ADJECTIVES.length)];
            String noun = NOUNS[rand.nextInt(NOUNS.length)];
            int num = 100 + rand.nextInt(900);
            String candidate = adj + "_" + noun + "_" + num;
            if (!userRepository.existsByUsername(candidate)) {
                return candidate;
            }
        }
        return "user_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private AuthResponse createSessionToken(String username, String email) {
        String token = UUID.randomUUID().toString();
        userTokenRepository.save(new UserToken(token, username));
        return new AuthResponse(token, username, email);
    }
}
