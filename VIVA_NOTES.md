# VIVA NOTES — ChatFlow

## Q: How is Authentication implemented?

**A:** Authentication uses token-based Bearer authentication. When a user logs in via `POST /api/auth/login`, credentials are authenticated against the `users` collection in MongoDB. Upon success, a unique session token (UUID) is generated, persisted in the `user_tokens` collection, and returned to the client. The frontend stores this in `localStorage` and sends it via the `Authorization: Bearer <token>` header with every subsequent request. An `AuthInterceptor` intercepts protected endpoints and validates the token.

## Q: How is Authorization enforced?

**A:** Authorization is enforced at the service layer (`SessionService`):
1. **Unauthenticated access (401):** The `AuthInterceptor` checks for a valid Bearer token. If missing or invalid, it rejects the request with HTTP 401 Unauthorized.
2. **Unauthorized session access (403):** When a user requests to view, send, or delete messages for a `sessionId`, the service verifies `session.hasParticipant(authenticatedUser)`. If an authenticated user (e.g. Carol) tries to access messages between Alice and Bob, the server immediately rejects the request with HTTP 403 Forbidden.

## Q: How are messages stored per session?

**A:** Every message document in MongoDB includes a dedicated `sessionId` field linking it to a `chat_sessions` document. When messages are loaded (`GET /api/sessions/{sessionId}/messages`), they are queried using `findTop50BySessionIdOrderBySentAtDesc(sessionId)` backed by a MongoDB compound index on `{'sessionId': 1, 'sentAt': 1}`. When a session is deleted, all messages tagged with that `sessionId` are cleanly hard-deleted.

## Q: Why is the Session ID sorted (`ConversationIdUtil`)?

**A:** If Alice initiates a session with Bob, the ID is `"alice__bob"`. If Bob opens a chat with Alice, it must resolve to the exact same session. Lexicographical sorting guarantees deterministic, order-independent session IDs without creating duplicate records or split conversation histories.

## Q: Why MongoDB over a relational database like PostgreSQL?

**A:** Chat messages are write-heavy, immutable document logs. MongoDB’s document model naturally represents JSON messages and session entities without ORM overhead or complex join tables. Furthermore, MongoDB provides horizontal sharding by `sessionId` and compound indexing on `(sessionId, sentAt)`.

## Q: What happens during a session delete? How is the polling race condition handled?

**A:** When `clear()` is triggered:
1. `DELETE /api/sessions/{sessionId}` is executed, which hard-deletes all messages with that `sessionId` and the session record from MongoDB.
2. The client resets `lastCountRef.current = 0` and sets `messages = []`.
3. Resetting `lastCountRef` is critical: without it, the next poll would compare `0` with the previous count and might suppress updating the state.
4. The other tab's poll executes within 2 seconds, fetches `[]` from MongoDB, and also clears its screen.
