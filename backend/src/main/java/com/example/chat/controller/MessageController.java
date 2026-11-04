package com.example.chat.controller;

import com.example.chat.dto.MessageRequest;
import com.example.chat.model.Message;
import com.example.chat.service.ConversationIdUtil;
import com.example.chat.service.MessageService;
import com.example.chat.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final SessionService sessionService;

    public MessageController(MessageService messageService, SessionService sessionService) {
        this.messageService = messageService;
        this.sessionService = sessionService;
    }

    @GetMapping("/unread-count")
    public Map<String, Object> getUnreadCount(HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        long count = sessionService.getUnreadCount(currentUser);
        return Map.of("unreadCount", count);
    }

    @GetMapping
    public List<Message> getConversation(@RequestParam String userA,
                                         @RequestParam String userB,
                                         HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        return messageService.getConversation(userA, userB, currentUser);
    }

    @PostMapping
    public Message send(@Valid @RequestBody MessageRequest messageRequest,
                        HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        if (messageRequest.getSenderId() == null || messageRequest.getSenderId().isBlank()) {
            messageRequest.setSenderId(currentUser);
        }
        return messageService.send(messageRequest, currentUser);
    }

    @DeleteMapping
    public Map<String, Object> deleteConversation(@RequestParam String userA,
                                                   @RequestParam String userB,
                                                   HttpServletRequest request) {
        String currentUser = (String) request.getAttribute("currentUser");
        long count = messageService.deleteConversation(userA, userB, currentUser);
        String conversationId = ConversationIdUtil.of(userA, userB);
        return Map.of("deleted", count, "conversationId", conversationId);
    }
}
