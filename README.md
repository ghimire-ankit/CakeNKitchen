# 🎂 CakeNKitchen - BCA VI Semester Project II

An elegant, production-ready, cloud-deployed E-commerce web application specialized for booking custom cakes. Developed as a major project milestone for **Bachelor of Computer Applications (BCA) Sixth Semester (Project II)**.

---

## 🚀 1. Live Deployment Links
*   **Web Application (Frontend)**: [https://cake-n-kitchen.vercel.app/](https://cake-n-kitchen.vercel.app/)
*   **Application Server (REST API)**: [https://cakenkitchen.onrender.com/](https://cakenkitchen.onrender.com/)

---

## 🛠️ 2. Technology Stack
*   **Frontend Interface Layer**: React 19 (SPA), Vite (Bundler), Axios (API client), Custom Minimalist Editorial styling system.
*   **Backend Application Server**: Node.js, Express.js (REST API endpoints), CORS, JSON Web Tokens (JWT), Bcrypt (Password encryption).
*   **Database Storage Layer**: MySQL Relational Database (Hosted on Aiven Cloud for persistent cloud storage, or XAMPP for local hosting).

---

## 🗄️ 3. Database Relational Schema
The database consists of **5 relational tables** enforcing strict integrity constraints:

1.  **`users`**: Manages customer profiles, emails, phone numbers, encrypted passwords, and authorization roles (`customer` vs `admin`).
2.  **`categories`**: Grouping criteria for cake classes (Tiered Wedding, Premium Chocolate, Fruit Delights).
3.  **`cakes`**: Core catalog properties containing name, descriptions, dynamic prices, category IDs, and image filenames.
4.  **`orders`**: Tracks individual transactions, status flags (Pending, Preparing, Ready, Delivered), totals, delivery dates, times, and delivery locations.
5.  **`order_items`**: Junction table relating specific items, quantities, custom messages, sizes, and purchase prices.

---

## 🛡️ 4. Security & Safety Mechanisms
*   **SQL Injection Prevention**: All database query queries utilize parameterized inputs via queries arrays rather than string concatenation, neutralizing malicious SQL execution attempts.
*   **Password Cryptography**: Passwords are securely processed using standard **Bcrypt cryptography with 10 salt rounds** before storage.
*   **Admin Route Authorization Check**: Restricted navbar options and backend-facing controllers. Typing `/admin` directly into React routes redirects users to a security block "Access Denied" page if they do not hold an authenticated `admin` role.

---

## 💻 5. Running the Project Locally

### Prerequisites:
1.  **Node.js** (v18 or higher) installed on your system.
2.  **XAMPP Control Panel** (or WAMP) running locally.

### Step 1: Initialize Database
1.  Start **Apache** and **MySQL** inside your XAMPP Control Panel.
2.  Go to `http://localhost/phpmyadmin` and create a database named `cakenk`.
3.  Import the SQL schema file located at `database/schema.sql` into your new database.

### Step 2: Run Backend REST Server
1.  Open your VS Code terminal and move into the backend folder:
    ```bash
    cd cakenkitchen-backend
    ```
2.  Install required application dependencies:
    ```bash
    npm install
    ```
3.  Create or verify the `.env` file matches your local environment variables:
    ```env
    PORT=3000
    MYSQL_HOST=localhost
    MYSQL_USER=root
    MYSQL_PASSWORD=
    MYSQL_DATABASE=cakenk
    JWT_SECRET=your_secret_key
    ```
4.  Start the Node server:
    ```bash
    npm start
    ```

### Step 3: Run Frontend Interface
1.  Open a second terminal window in VS Code and move into the frontend folder:
    ```bash
    cd cakenkitchen-frontend
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm run dev
    ```
4.  Open the website in your browser using the local dev port link shown (usually `http://localhost:5173`).

---

## 🧁 6. Default Admin Login Credentials
Use these pre-synced administrator credentials to access the shop controls:
*   **Email**: `admin@cakenkitchen.com`
*   **Password**: `admin123`
