package com.example.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSessionRequest {

    @NotBlank
    private String otherUser;

    public CreateSessionRequest() {}

    public CreateSessionRequest(String otherUser) {
        this.otherUser = otherUser;
    }

    public String getOtherUser() { return otherUser; }
    public void setOtherUser(String otherUser) { this.otherUser = otherUser; }
}

