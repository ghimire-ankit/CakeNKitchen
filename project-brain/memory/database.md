# Memory Domain - Database Layer

## Schema & Pool Config
*   **Engine:** MySQL InnoDB supporting foreign key constraints.
*   **Database Config:** `/src/config/db.js` coordinates a Promise-based pool connection (max limit: 10, queue limit: 0).
*   **Self-Healing Schema:** Automatically checks, creates tables, and syncs basic parameters:
    *   `users`: ID, name, email (unique), phone, password_hash, role ('customer', 'admin').
    *   `categories`: cat_id (PK), name (unique), description, image_url.
    *   `cakes`: cake_id (PK), name, description, base_price, cat_id, image_url, is_available.
    *   `orders`: order_id (PK), user_id, status (Pending, Preparing, Ready, Delivered, Cancelled), total, delivery_date, delivery_address, delivery_time, notes.
    *   `order_items`: item_id (PK), order_id, cake_id, qty, weight_lbs, purchase_price, subtotal, message.
*   **Auto-Seeding:** Automatically seeds baseline admin user (`admin@cakenkitchen.com` / `admin123`) and 10 default cake inventory rows if tables are clean.
