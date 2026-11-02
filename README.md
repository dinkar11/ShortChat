# ShortChat 💬

A modern, full-screen web chat application featuring:
- **Home Feed:** Create, read, and like public posts.
- **Ephemeral 1-to-1 Chat:** Direct messaging where completing a session permanently deletes all messages and the session from MongoDB.
- **User Profiles:** Editable bio, join date, user posts stream, and primary email display.
- **Live User Search:** Search any registered user by username in real-time.
- **Random or Custom Unique Username:** Choose any unique username, or leave blank to automatically receive a generated username.
- **Full-Screen Responsive UI:** Edge-to-edge minimalist black and white design with native Fullscreen API support.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Spring Boot 4, Java 25, Spring Data MongoDB, REST APIs, Token-based Authentication
- **Database:** MongoDB Atlas (Cloud Replica Set)

---

## 🚀 Getting Started

### 1. Prerequisites
- Java 21+ (Java 25 recommended)
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### 2. Configure Environment
Create a `.env` file in the root or `backend/` directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ybjprf9.mongodb.net/chatflow_db?retryWrites=true&w=majority
PORT=8080
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.
