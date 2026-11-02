/**
 * ChatFlow Database Setup Script for MongoDB (Compass / mongosh)
 * Database Name: chatflow_db
 */

// 1. Switch to chatflow_db
use chatflow_db;

// 2. Create Collections
db.createCollection("users");
db.createCollection("user_tokens");
db.createCollection("chat_sessions");
db.createCollection("messages");

// 3. Create Indexes
// Users
db.users.createIndex({ username: 1 }, { unique: true });

// User Tokens
db.user_tokens.createIndex({ token: 1 }, { unique: true });
db.user_tokens.createIndex({ username: 1 });

// Chat Sessions
db.chat_sessions.createIndex({ userA: 1, userB: 1 });

// Messages (Stored per session)
db.messages.createIndex({ sessionId: 1, sentAt: 1 });
db.messages.createIndex({ conversationId: 1, sentAt: 1 });

// 4. Seed Default Users
db.users.deleteMany({ username: { $in: ["alice", "bob", "carol", "dave"] } });
db.users.insertMany([
  { username: "alice", password: "password123", createdAt: new Date() },
  { username: "bob", password: "password123", createdAt: new Date() },
  { username: "carol", password: "password123", createdAt: new Date() },
  { username: "dave", password: "password123", createdAt: new Date() }
]);

// 5. Seed Initial Demo Session and Messages
db.chat_sessions.updateOne(
  { _id: "alice__bob" },
  {
    $set: {
      _id: "alice__bob",
      userA: "alice",
      userB: "bob",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  { upsert: true }
);

db.messages.insertOne({
  sessionId: "alice__bob",
  conversationId: "alice__bob",
  senderId: "alice",
  receiverId: "bob",
  content: "Welcome to ChatFlow! Messages are stored per session.",
  type: "TEXT",
  status: "SENT",
  sentAt: new Date()
});

print("ChatFlow database setup complete!");

