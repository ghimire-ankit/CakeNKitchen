# 🎂 CakeNKitchen - BCA VI Semester Project

CakeNKitchen is an elegant E-commerce web application designed for browsing, customizing, and booking cakes. Developed as a Project II milestone for the Bachelor of Computer Applications (BCA) Sixth Semester.

## 🚀 Deployment
*   **Web Application (Frontend)**: [https://cake-n-kitchen.vercel.app/](https://cake-n-kitchen.vercel.app/)
*   **Application Server (REST API)**: [https://cakenkitchen.onrender.com/](https://cakenkitchen.onrender.com/)

---

## 🛠️ Technology Stack
*   **Frontend**: React (SPA), Vite, Axios, Custom CSS.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL Relational Database.

---

## 💻 Running Locally

### Step 1: Database Setup
1. Create a MySQL database (e.g. `cakenk`).
2. Import the layout schema file located at `database/schema.sql`.

### Step 2: Backend REST Server
1. Move to backend directory:
   ```bash
   cd cakenkitchen-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `PORT`, `JWT_SECRET`
4. Start backend server:
   ```bash
   npm start
   ```

### Step 3: Frontend Interface
1. Move to frontend directory:
   ```bash
   cd cakenkitchen-frontend
   ```
2. Install dependencies & start dev environment:
   ```bash
   npm install
   npm run dev
   ```
