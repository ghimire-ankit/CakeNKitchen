

CREATE DATABASE IF NOT EXISTS cakenk;
USE cakenk;

-- 1. Identity Subsystem
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Catalog Structural Groups
CREATE TABLE categories (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    image_url VARCHAR(255) NULL
) ENGINE=InnoDB;

-- 3. Core Product Inventory
CREATE TABLE cakes (
    cake_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    cat_id INT NOT NULL,
    image_url VARCHAR(255) NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_price CHECK (base_price > 0.00)
) ENGINE=InnoDB;

-- 4. Order Records
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    status ENUM('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    total DECIMAL(10, 2) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_time VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Order Detail Attributes
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    cake_id INT NOT NULL,
    qty INT NOT NULL,
    weight_lbs INT NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (cake_id) REFERENCES cakes(cake_id) ON DELETE RESTRICT
) ENGINE=InnoDB;
