# ShortChat Backend 🚀

Spring Boot 4 + Java 25 backend REST API for ShortChat, powered by MongoDB Atlas.

---

## 🌟 Key Features

- **Authentication & Token Sessions:** Custom bearer token authentication and session tracking.
- **Home Feed Posts:** Endpoints to create, fetch, like, and delete user posts.
- **Ephemeral 1-to-1 Chat:** Direct messaging stored per session. Completing a session wipes all messages and the session from MongoDB.
- **User Profiles & Search:** Real-time user search by username, public profile endpoints, and editable bio.
- **Unique or Random Usernames:** Supports custom unique username or auto-generated unique usernames.
- **Root Redirect:** Visiting the root URL (`http://localhost:8080/`) seamlessly redirects browser clients to the React frontend (`http://localhost:5173/`).

---

## 🛠 Tech Stack

- **Language:** Java 25
- **Framework:** Spring Boot 4
- **Database:** MongoDB Atlas (Cloud Replica Set) via Spring Data MongoDB
- **Security:** Token-based Auth via `AuthInterceptor`
- **Build Tool:** Maven

---

## ⚙️ Setup & Running

1. Create a `.env` file in this directory based on `.env.example`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ybjprf9.mongodb.net/chatflow_db?retryWrites=true&w=majority
   PORT=8080
   ```
2. Build and run the service:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.
