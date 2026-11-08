-- ============================================================
-- ShopEase Seed Data (PostgreSQL)
-- Default test accounts, realistic products & initial test orders
-- ============================================================

-- 1. USERS SEED
-- Passwords:
-- admin@shopease.com -> Admin@123
-- john@example.com -> Customer@123
-- jane@example.com -> Customer@123
INSERT INTO users (id, name, email, password, role, created_at) VALUES
(1, 'Admin User', 'admin@shopease.com', '$2a$10$MMU3Rrk9fEGjdOCfkbOyaOFvJ5QF6YODut2t.XFFoVPZ5zNZiOAIW', 'ADMIN', NOW() - INTERVAL '10 days'),
(2, 'John Customer', 'john@example.com', '$2a$10$i4WT.7FaTIf3rw8Qli3ZaunCM19lNaas5/.iKH/PLHmnlp8QpGd3u', 'CUSTOMER', NOW() - INTERVAL '7 days'),
(3, 'Jane Shopper', 'jane@example.com', '$2a$10$i4WT.7FaTIf3rw8Qli3ZaunCM19lNaas5/.iKH/PLHmnlp8QpGd3u', 'CUSTOMER', NOW() - INTERVAL '5 days'),
(4, 'Test Customer One', 'customer1@shopease.com', '$2a$10$i4WT.7FaTIf3rw8Qli3ZaunCM19lNaas5/.iKH/PLHmnlp8QpGd3u', 'CUSTOMER', NOW() - INTERVAL '4 days'),
(5, 'Test Customer Two', 'customer2@shopease.com', '$2a$10$i4WT.7FaTIf3rw8Qli3ZaunCM19lNaas5/.iKH/PLHmnlp8QpGd3u', 'CUSTOMER', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Reset users sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. PRODUCTS SEED (18 Realistic Products)
INSERT INTO products (id, name, description, category, price, stock, image, created_at) VALUES
-- Laptops
(1, 'UltraBook Pro 15', '15.6" 3.2K OLED display, Intel Core i7 13th Gen, 32GB RAM, 1TB NVMe SSD, Thunderbolt 4.', 'Laptops', 1299.99, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '15 days'),
(2, 'MacBook Air M2', '13.6-inch Liquid Retina Display, Apple M2 chip, 8-core CPU, 16GB Unified Memory, 512GB SSD.', 'Laptops', 1099.00, 10, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '14 days'),
(3, 'ThinkPad Carbon X1', 'Ultra-light business laptop, 14" WUXGA Anti-glare, Intel vPro Core i7, 16GB RAM, 512GB SSD.', 'Laptops', 1449.50, 8, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '12 days'),

-- Phones
(4, 'Galaxy S24 Ultra', '6.8" Dynamic AMOLED 2X, 200MP Quad Camera, Snapdragon 8 Gen 3, S-Pen included, 512GB.', 'Phones', 1199.99, 20, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '11 days'),
(5, 'iPhone 15 Pro', '6.1" Super Retina XDR, Titanium frame, A17 Pro chip, Action button, USB-C, 256GB storage.', 'Phones', 999.00, 18, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '10 days'),
(6, 'Pixel 8 Pro', '6.7" Super Actua display, Google Tensor G3, Best Take, Magic Editor camera, 128GB Bay Blue.', 'Phones', 899.00, 12, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '9 days'),

-- Electronics
(7, 'Sony WH-1000XM5 Headphones', 'Industry-leading noise cancelling wireless headphones, Auto NC Optimizer, 30-hour battery life.', 'Electronics', 348.00, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '8 days'),
(8, 'Bose QuietComfort 45', 'Legendary noise cancelling, high-fidelity audio, Aware Mode, lightweight comfort, 24-hour battery.', 'Electronics', 279.00, 14, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '8 days'),
(9, '4K Ultra HD Smart TV 55"', 'Quantum Dot LED 4K UHD, HDR10+, Dolby Vision, 120Hz native refresh rate, smart voice assistant.', 'Electronics', 599.99, 6, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '7 days'),
(10, 'Smart Fitness Watch v2', 'Optical heart-rate sensor, GPS tracking, sleep score, water resistant 50m. Currently out of stock.', 'Electronics', 199.99, 0, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '6 days'),

-- Accessories
(11, 'Ergonomic Mechanical Keyboard', 'Wireless Bluetooth 5.0, Hot-swappable switches, RGB backlighting, custom PBT keycaps.', 'Accessories', 119.99, 35, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '5 days'),
(12, 'Precision Wireless Gaming Mouse', 'Ultralight 63g design, HERO 25K Sensor, 1ms wireless response, customizable DPI up to 25600.', 'Accessories', 69.99, 40, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '5 days'),
(13, 'USB-C Dual 4K Docking Station', '12-in-1 multi-port hub, Dual HDMI 4K@60Hz, 100W Power Delivery, Gigabit Ethernet, SD card reader.', 'Accessories', 149.99, 15, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '4 days'),
(14, 'Fast Wireless Charging Stand', '15W Qi-certified fast charging station for smartphones and earbuds, LED indicator, overcharge protection.', 'Accessories', 34.99, 50, 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '4 days'),
(15, 'Premium Leather Laptop Sleeve', 'Handcrafted genuine leather sleeve, soft microfiber interior, magnetic closure. Low stock (2 left).', 'Accessories', 45.00, 2, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '3 days'),

-- Gaming
(16, 'PlayStation 5 Digital Edition', 'Next-gen console with ultra-high speed SSD, ray tracing, 4K-TV gaming, Tempest 3D AudioTech.', 'Gaming', 449.99, 10, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '3 days'),
(17, 'Xbox Series X', 'Fastest, most powerful Xbox ever, 12 teraflops raw graphic processing power, 1TB custom NVME SSD.', 'Gaming', 499.99, 8, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '2 days'),
(18, 'Nintendo Switch OLED Model', 'Vibrant 7-inch OLED screen, wide adjustable stand, wired LAN port dock, 64GB internal storage.', 'Gaming', 349.99, 22, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Reset products sequence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. INITIAL SEED ORDERS (For QA verification)
-- Order 1 by John Customer (CONFIRMED)
INSERT INTO orders (id, user_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone, payment_method, created_at) VALUES
(1001, 2, 417.99, 'CONFIRMED', 'John Customer', '123 Test Avenue, Apt 4B', 'Metropolis', '10001', '+1-555-0199', 'Simulated Card', NOW() - INTERVAL '3 days'),
(1002, 2, 1099.00, 'DELIVERED', 'John Customer', '123 Test Avenue, Apt 4B', 'Metropolis', '10001', '+1-555-0199', 'Simulated Card', NOW() - INTERVAL '6 days'),
(1003, 3, 349.99, 'PROCESSING', 'Jane Shopper', '742 Evergreen Terrace', 'Springfield', '97477', '+1-555-0144', 'Cash on Delivery', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Reset orders sequence
SELECT setval('orders_id_seq', 1004);

-- Order Items for seed orders
INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES
(1, 1001, 7, 'Sony WH-1000XM5 Headphones', 348.00, 1, 348.00),
(2, 1001, 12, 'Precision Wireless Gaming Mouse', 69.99, 1, 69.99),
(3, 1002, 2, 'MacBook Air M2', 1099.00, 1, 1099.00),
(4, 1003, 18, 'Nintendo Switch OLED Model', 349.99, 1, 349.99)
ON CONFLICT (id) DO NOTHING;

-- Reset order items sequence
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
