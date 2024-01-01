-- CREATE DATABASE stylish;
USE stylish;
-- 創建products表格
DROP TABLE IF EXISTS products;
CREATE TABLE `products`
(
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `category`    VARCHAR(255),
    `title`       VARCHAR(255),
    `description` TEXT,
    `price`       DECIMAL(10, 2),
    `texture`     VARCHAR(255),
    `wash`        VARCHAR(255),
    `place`       VARCHAR(255),
    `note`        VARCHAR(255),
    `story`       TEXT,
    `main_image`  MEDIUMTEXT
);

-- 創建productImages表格
DROP TABLE IF EXISTS productImages;
CREATE TABLE `productImages`
(
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT,
    `image`      MEDIUMTEXT,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 創建colors表格
DROP TABLE IF EXISTS colors;
CREATE TABLE colors
(
    color_code VARCHAR(255) PRIMARY KEY,
    name       VARCHAR(255)
);

-- 創建productsColors表格
DROP TABLE IF EXISTS productColors;
CREATE TABLE productColors
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    color_code VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (color_code) REFERENCES colors (color_code)
);

-- 創建productSizes表格
DROP TABLE IF EXISTS productSizes;
CREATE TABLE productSizes
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    size       VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 創建variants表格
DROP TABLE IF EXISTS variants;
CREATE TABLE variants
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    color_code VARCHAR(7),
    size       VARCHAR(255),
    stock      INT,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (color_code) REFERENCES colors (color_code)
);


-- 創建users表格
DROP TABLE IF EXISTS users;
create table users
(
    `id`       int auto_increment primary key,
    `provider` varchar(50)  null,
    `name`     varchar(100) not null,
    `email`    varchar(100) not null unique,
    `picture`  varchar(255) null,
    `password` varchar(255) not null
);


-- 創建recipients表格
DROP TABLE IF EXISTS recipients;
CREATE TABLE recipients
(
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(255),
    phone   VARCHAR(255),
    email   VARCHAR(255),
    address VARCHAR(255),
    time    VARCHAR(255)
);



-- 創建orders表格
DROP TABLE IF EXISTS orders;
CREATE TABLE orders
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shipping     VARCHAR(255),
    payment      VARCHAR(255),
    subtotal     INT,
    freight      INT,
    total        INT,
    user_id      INT,
    recipient_id INT,
    paid         BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES recipients (id)
);

CREATE TABLE orders
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    total     INT,
    product_id      INT,
    color VARCHAR(255),
    price INT,
    qty INT,
    size VARCHAR(255)
);

-- 創建orderProducts表格
DROP TABLE IF EXISTS orderProducts;
CREATE TABLE orderProducts
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT,
    product_id INT,
    variant_id INT,
    quantity   INT,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (variant_id) REFERENCES variants (id)
);
