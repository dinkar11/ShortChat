# ARCHITECTURE.md — ChatFlow

## Overview & Architecture Layers

```
Browser (React 18 + Vite)
      │  HTTP REST (Bearer Token Auth)
      ▼
Controller Layer (AuthController, SessionController, MessageController)
      │  AuthInterceptor (Token Validation & 401 Guard)
      ▼
Service Layer (AuthService, SessionService, MessageService)
      │  Enforces Authorization (403 Forbidden for non-participants)
      ▼
Repository Layer (UserRepository, UserTokenRepository, ChatSessionRepository, MessageRepository)
      │  Spring Data MongoDB Queries
      ▼
MongoDB (Collections: users, user_tokens, chat_sessions, messages)
```

Each layer has a clean, single responsibility:
- **Authentication Interceptor** — Validates incoming `Authorization: Bearer <token>` headers before reaching controllers.
- **Controllers** — Handles HTTP request parsing, input validation (`@Valid`), and response formatting.
- **Services** — Implements business logic, participant authorization checks, and session management.
- **Repositories** — Spring Data MongoDB interfaces for querying documents.
- **MongoDB** — Stores user credentials, active auth tokens, chat sessions, and messages per session.

---

## Authentication & Authorization Model

### 1. Authentication (Who are you?)
- **Endpoints:**
  - `POST /api/auth/register` — Create a new user account.
  - `POST /api/auth/login` — Verifies credentials and generates a secure session token (UUID).
  - `GET /api/auth/me` — Returns the current authenticated user.
  - `POST /api/auth/logout` — Revokes the active session token.
- **Token Persistence:**
  - Tokens are stored in MongoDB (`user_tokens` collection) with `username` and `createdAt`.
  - Storing tokens in the database guarantees that user logins persist even across server restarts.
- **Client Storage:**
  - The React client saves the token in `localStorage`.
  - An Axios request interceptor automatically attaches `Authorization: Bearer <token>` to all outgoing requests.
- **Pre-seeded Accounts for Demo:**
  - Default users `["alice", "bob", "carol", "dave"]` (default password: `password123`) are pre-populated by `DataInitializer` on startup.

### 2. Authorization (What are you allowed to do?)
- **Session-Level Access Control:**
  - Every chat session has two participants (`userA` and `userB`).
  - In `SessionService`:
    ```java
    if (!session.hasParticipant(authenticatedUser)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
            "Access denied: You are not a participant in this session");
    }
    ```
  - **401 Unauthorized:** Returned if no valid token is provided.
  - **403 Forbidden:** Returned if a logged-in user (e.g., Carol) attempts to read, write, or delete messages in a session between Alice and Bob.

---

## Storing Messages Per Session

Messages are organized and stored strictly by **`sessionId`**:

```json
{
  "id": "67...",
  "sessionId": "alice__bob",
  "senderId": "alice",
  "receiverId": "bob",
  "content": "Hello Bob!",
  "type": "TEXT",
  "status": "SENT",
  "sentAt": "2026-11-02T14:00:00Z"
}
```

1. **Deterministic Session ID:**
   `ConversationIdUtil.of(userA, userB)` sorts user IDs lexicographically:
   ```
   of("bob", "alice")   → "alice__bob"
   of("alice", "bob")   → "alice__bob"
   ```
   This ensures that no matter who initiates the chat, both users are directed to the exact same session document.
2. **Session Document (`chat_sessions`):**
   Stores `userA`, `userB`, `createdAt`, and `updatedAt`.
3. **Compound Indexes for Query Performance:**
   - `{'sessionId': 1, 'sentAt': 1}` — Enables sub-millisecond retrieval of the latest 50 messages per session.
4. **Hard Delete Behavior:**
   Deleting a session deletes the session document and removes all messages matching `sessionId` from MongoDB.

---

## Polling Tradeoff & WebSocket Roadmap

- **Current Implementation:**
  - Polling interval of 2000ms (`useConversation` hook).
  - Uses `lastCountRef` as a lightweight change detector to avoid unnecessary re-renders.
- **Pros:**
  - Highly reliable, firewall-friendly, stateless HTTP.
  - Zero WebSocket connection state management.
- **WebSocket Upgrade Path:**
  - Replace `setInterval` in `useConversation.js` with a STOMP over SockJS subscription:
    ```javascript
    stompClient.subscribe(`/topic/session/${sessionId}`, (msg) => ...);
    ```
  - The rest of the backend architecture (models, sessions, authorization) remains identical.
