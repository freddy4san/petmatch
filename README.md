# 🐾 PetMatch

PetMatch is a full-stack application that helps pet owners discover, connect, and match their pets with others nearby — similar to a social matching app, but for pets.

---

## 🚀 Tech Stack

### Frontend

* React (Create React App)
* Feature-based architecture
* REST API integration

### Backend

* Node.js + Express
* Prisma ORM
* PostgreSQL

---

## 📁 Project Structure

```
petmatch/
  server/      # Backend API (Express + Prisma)
  frontend/    # React frontend
```

---

## ✨ Features

* 🔐 User authentication (signup & login)
* 🐶 Pet profile creation & management
* 🔍 Pet discovery (browse nearby pets)
* ❤️ Like & match system
* 💬 Chat between matched users (planned)
* ⚙️ User preferences & settings

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/freddy4san/petmatch.git
cd petmatch
```

---

## 🖥 Backend Setup

```
cd server
npm install
```

### Create `.env`

```
DATABASE_URL="postgresql://user:password@localhost:5432/petmatch?schema=public"
JWT_SECRET="your_secret"
PORT=3001
```

### Run database migrations

```
npx prisma migrate dev --name init
```

### Start backend server

```
npm run dev
```

Backend runs on:
👉 http://localhost:3001

---

## 🌐 Frontend Setup

```
cd frontend
npm install
npm start
```

Frontend runs on:
👉 http://localhost:3000

---

## 🔗 API Base URL

All API requests go to:

```
http://localhost:3001/api
```

---

## 🧠 Development Notes

* Frontend is structured using a **feature-based architecture**
* All API calls go through a shared API client
* Backend uses Prisma for database management
* Migrations are tracked and committed to Git

---

## 🛠 Future Improvements

* 💬 Real-time chat (WebSockets)
* 📍 Location-based matching
* 📸 Image uploads for pets
* 🔔 Notifications system
* 🧪 Testing (unit + integration)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built by freddy4san and EGonzalezRomero

---

## ⭐ Support

If you like this project, give it a star ⭐
