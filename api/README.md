# 🐾 Responsible Pet Adoption Platform — Backend

Backend service for the Responsible Pet Adoption Platform — a system designed to connect NGOs, donors, and adopters through a secure and transparent adoption workflow.  
Built with **Node.js, Express, TypeScript, Zod, JWT, PostgreSQL**, and optional **Prisma ORM**.

---

## 🚀 Overview

This backend provides a robust REST API that powers the entire adoption platform.  
It handles authentication, user roles, animal management, NGO operations, messaging, and the full adoption workflow.

---

## 🧱 Tech Stack

- Node.js  
- Express
- TypeScript
- Zod (schema validation)
- JWT Authentication
- PostgreSQL
- Prisma ORM
- Multer (file uploads)
- Swagger (API documentation)

---

## 📌 Core Features

### 🔐 Authentication & Authorization
- Secure JWT-based login
- Zod validation for all payloads

### 🐶 Animal Management
- CRUD operations for pets
- Upload photos/videos  
- Status tracking (available, in process, adopted)

### 🔎 Search & Filters
- Species, breed, age, size, behavior, location  
- Pagination and sorting

### 📨 Adoption Workflow
- Express interest in a pet  
- User receives notification  
- Secure messaging  
- Visit scheduling  
- Adoption approval

---

## 📂 Project Structure
src/
controllers/
services/
repositories/
models/
middlewares/
routes/
utils/


---

## 🔌 API Endpoints (Summary)

- `/auth` — login, register  
- `/user` — user profile
- `/animals` — pet CRUD  
- `/adoptions` — adoption workflow  
- `/messages` — secure chat

---

## 📄 License

MIT License

---

## 📫 Contact

**Mario Ohashi**
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/marioohashi)

