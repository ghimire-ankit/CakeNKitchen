# Memory Domain - Backend Layer

## Configuration & Routes
*   **Location:** `/cakenkitchen-backend/`
*   **Infrastructure:** Built using `Express v5.2` and CORS settings permitting origin validation for local dev-servers and Vercel production hosting (`https://cake-n-kitchen.vercel.app`).
*   **Entry Point:** `server.js` (Binds global routers, initializes DB self-healing schemas, and runs on `PORT 3000`).
*   **Controllers:** 
    *   `authController.js`: Resolves customer registration, login verification, and issues signed JWT tokens expiring in 24 hours.
    *   `catalogController.js`: Coordinates category lists, filter queries, order creation transactions, and admin toggles.
*   **Authentication Guards:** `middleware/auth.js` enforces `authenticateToken` JWT headers and `isAdmin` roles checking.
