package com.example.chat.service;

/**
 * Deterministic conversation ID generator.
 *
 * WHY SORTING MATTERS:
 * If alice opens a chat with bob, the ID is "alice__bob".
 * If bob opens a chat with alice, it must ALSO be "alice__bob".
 * Sorting the two user IDs lexicographically guarantees the same ID
 * regardless of who initiates the conversation, preventing duplicate threads.
 */
public final class ConversationIdUtil {

    private ConversationIdUtil() {
        // utility class — no instances
    }

    public static String of(String userA, String userB) {
        if (userA == null || userB == null) {
            throw new IllegalArgumentException("Both user IDs must be non-null");
        }
        return userA.compareTo(userB) <= 0
                ? userA + "__" + userB
                : userB + "__" + userA;
    }
}

