package com.example.chat.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Optional<JavaMailSender> mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = Optional.ofNullable(mailSender);
    }

    public boolean sendOtpEmail(String toEmail, String otp) {
        String subject = "ShortChat - Password Reset OTP";
        String content = "Hello,\n\n"
                + "You requested to reset your password on ShortChat.\n\n"
                + "Your 6-digit One-Time Password (OTP) is: " + otp + "\n\n"
                + "This OTP is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
                + "Best regards,\nThe ShortChat Team";

        log.info("=================================================");
        log.info("[ShortChat OTP] Password Reset OTP for {}: {}", toEmail, otp);
        log.info("=================================================");

        if (mailSender.isPresent() && fromEmail != null && !fromEmail.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.get().send(message);
                log.info("OTP email successfully sent via SMTP to {}", toEmail);
                return true;
            } catch (Exception e) {
                log.warn("Failed to send email via SMTP to {}: {}. OTP was logged to console.", toEmail, e.getMessage());
            }
        } else {
            log.info("SMTP credentials not configured (spring.mail.username is empty). OTP logged to console.");
        }
        return false;
    }

    public boolean isSmtpConfigured() {
        return mailSender.isPresent() && fromEmail != null && !fromEmail.isBlank();
    }
}

