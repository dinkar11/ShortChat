package com.example.chat.service;

import com.example.chat.dto.AuthRequest;
import com.example.chat.dto.AuthResponse;
import com.example.chat.model.PasswordResetOtp;
import com.example.chat.model.User;
import com.example.chat.model.UserToken;
import com.example.chat.repository.PasswordResetOtpRepository;
import com.example.chat.repository.UserRepository;
import com.example.chat.repository.UserTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailService emailService;

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

    public AuthService(UserRepository userRepository,
                       UserTokenRepository userTokenRepository,
                       PasswordResetOtpRepository passwordResetOtpRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.userTokenRepository = userTokenRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.emailService = emailService;
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

    public Map<String, Object> sendPasswordResetOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        String email = rawEmail.trim().toLowerCase();

        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with this email address"));

        // Generate secure 6-digit OTP
        int code = new java.security.SecureRandom().nextInt(900_000) + 100_000;
        String otp = String.valueOf(code);

        // Delete any existing OTPs for this email and save new one (valid for 10 minutes)
        passwordResetOtpRepository.deleteByEmail(email);
        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);
        passwordResetOtpRepository.save(new PasswordResetOtp(email, otp, expiresAt));

        emailService.sendOtpEmail(email, otp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", email);
        response.put("message", "A 6-digit verification code has been sent to " + email);
        if (!emailService.isSmtpConfigured()) {
            response.put("devOtp", otp);
            response.put("note", "SMTP is unconfigured; OTP provided in response for development/testing.");
        }
        return response;
    }

    public Map<String, Object> resetPasswordWithOtp(String rawEmail, String otp, String newPassword) {
        if (rawEmail == null || rawEmail.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        String email = rawEmail.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found with this email address"));

        if (otp == null || otp.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        PasswordResetOtp resetOtp = passwordResetOtpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active OTP request found. Please request a new code."));

        if (Instant.now().isAfter(resetOtp.getExpiresAt())) {
            passwordResetOtpRepository.deleteByEmail(email);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired. Please request a new code.");
        }

        if (!resetOtp.getOtp().equals(otp.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code. Please check and try again.");
        }

        if (newPassword == null || newPassword.trim().length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 4 characters long");
        }

        user.setPassword(newPassword.trim());
        userRepository.save(user);
        passwordResetOtpRepository.deleteByEmail(email);

        return Map.of(
                "success", true,
                "message", "Password has been successfully reset. Please sign in with your new password."
        );
    }

    private AuthResponse createSessionToken(String username, String email) {
        String token = UUID.randomUUID().toString();
        userTokenRepository.save(new UserToken(token, username));
        return new AuthResponse(token, username, email);
    }
}
