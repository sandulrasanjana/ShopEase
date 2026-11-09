# ShopEase - E-Commerce Web Application & QA Testing Benchmark

![ShopEase Status](https://img.shields.io/badge/Status-Ready%20for%20QA%20Testing-blue.svg)
[![CI Status](https://github.com/sandulrasanjana/ShopEase/actions/workflows/ci.yml/badge.svg)](https://github.com/sandulrasanjana/ShopEase/actions/workflows/ci.yml)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-green.svg)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)
![Container](https://img.shields.io/badge/Container-Docker%20%7C%20Compose-2496ed.svg)
![Automation Ready](https://img.shields.io/badge/Automation-Playwright%20Ready-brightgreen.svg)

---

## 1. Project Overview

**ShopEase** is a full-stack, portfolio-level e-commerce web application engineered specifically as a realistic, testable benchmark for **Software Quality Assurance (SQA) Engineers**. 

### QA Context Notice
> **Note for Evaluators and Recruiters:**  
> This application is actively developed as the primary System Under Test (SUT) for an end-to-end Software Quality Assurance portfolio. Manual testing, API functional testing (Postman), database integrity verification (SQL), automated UI testing (Playwright), and formal defect tracking are performed directly by the QA Engineer. No fake test results or fabricated bugs are pre-generated.

---

## 2. Core Features & User Flows

ShopEase provides realistic e-commerce capabilities divided across two distinct user roles:

### Customer Flow
1. **User Registration:** Client-side & server-side validation (email format, password min-length, confirmation match, duplicate prevention).
2. **Authentication:** Secure JWT authentication and bcrypt password hashing.
3. **Product Discovery:**
   - Real-time search across product titles and descriptions.
   - Category filtering (Laptops, Phones, Electronics, Accessories, Gaming).
   - Price range filtering (Min / Max price).
   - Sorting by Price (Ascending/Descending), Alphabetical, or Newest.
4. **Product Details:** Detailed specifications, stock status badges, real-time quantity validation.
5. **Shopping Cart:** Add products, update quantities, remove items, clear cart, server-enforced stock limits.
6. **Checkout & Ordering:** Full address validation, simulated payment method selection, backend atomic transaction (stock deduction, unit price historical freeze).
7. **Order History & Tracking:** Review past orders, view historical purchase receipts, cancel PENDING orders with automatic stock restoration.
8. **User Profile:** Account role inspection and profile details.

### Admin Flow
1. **Admin Portal:** Protected authentication with strict role-based access control (RBAC).
2. **Dashboard Analytics:** Live metrics for total revenue (excluding cancelled orders), total orders, active products, out-of-stock items, and customer count.
3. **Product Management:** Full CRUD (Create, Read, Update, Delete) for catalog items with stock controls.
4. **Order Fulfillment:** Comprehensive view of all customer orders, filter by status, and live status transitions (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`).

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router v6, CSS Custom Properties, Axios, Lucide React |
| **Backend** | Node.js (v22), Express, TypeScript, pg (node-postgres), bcryptjs, jsonwebtoken, CORS |
| **Database** | PostgreSQL 15+ (Normalized tables, foreign keys, cascade rules, check constraints) |
| **DevOps / Containers** | Docker, Docker Compose, Nginx (Alpine-based reverse proxy & SPA host) |
| **QA Automation Ready** | Deterministic `data-testid` selectors, predictable UI states, REST API contract |

---

## 4. Project Directory Structure

```text
ShopEase/
├── frontend/                     # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Reusable UI (Navbar, Footer, ProductCard, Modals, Spinners, etc.)
│   │   ├── context/              # Global React Contexts (AuthContext, CartContext)
│   │   ├── layouts/              # MainLayout with header, outlet, and footer
│   │   ├── pages/                # Customer pages (Home, Products, ProductDetail, Cart, Checkout, etc.)
│   │   │   └── admin/            # Admin pages (Dashboard, Products, Orders, OrderDetail, Form)
│   │   ├── services/             # Axios API client modules (auth, products, cart, orders, admin)
│   │   ├── styles/               # Clean, responsive CSS stylesheet
│   │   ├── types/                # Strict TypeScript interfaces & API contracts
│   │   ├── App.tsx               # Client router & route protection
│   │   ├── main.tsx              # Application entry point
│   │   └── vite-env.d.ts         # Vite client type definitions
│   ├── nginx.conf                # Nginx production reverse proxy config
│   ├── Dockerfile                # Multi-stage frontend Dockerfile
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite bundler configuration
│
├── backend/                      # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/               # Database pool connection & auto-migration scripts
│   │   ├── controllers/          # Business logic (auth, products, cart, orders, admin)
│   │   ├── middleware/           # JWT auth, RBAC authorization, centralized error handler
│   │   ├── routes/               # Modular Express API routers
│   │   ├── utils/                # JWT helpers, input validation, standardized JSON response
│   │   └── server.ts             # Express server bootstrap & health check
│   ├── Dockerfile                # Multi-stage backend Dockerfile
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # Backend TypeScript configuration
│
├── database/                     # Normalized PostgreSQL SQL files
│   ├── schema.sql                # DDL: Tables, constraints, foreign keys, indexes
│   └── seed.sql                  # DML: 18 realistic products, admin, and test customer accounts
│
├── docker-compose.yml            # Multi-container orchestration (frontend, backend, postgresql)
├── .env.example                  # Environment template
├── .gitignore                    # Version control ignore rules
└── README.md                     # Complete project documentation
```

---

## 5. Quick Start Guide

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose **OR**
- Node.js (v18+ or v20+) & PostgreSQL (v14+)

---

### Option A: Running with Docker Compose (Recommended)

1. **Clone or navigate to the repository:**
   ```bash
   cd ShopEase
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Frontend Web Application:** [http://localhost:3000](http://localhost:3000)
   - **Backend REST API:** [http://localhost:5000](http://localhost:5000)
   - **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **PostgreSQL Database:** `localhost:5432` (`db: shopease`, `user: postgres`, `password: postgrespassword`)

---

### Option B: Running Locally (Native Node & PostgreSQL)

#### 1-Click Launchers (Windows):
- **Initialize Database:** Double-click [`init-db.bat`](file:///d:/ShopEase/init-db.bat) to create the database, tables, and seed data.
- **Start All Services:** Double-click [`start-dev.bat`](file:///d:/ShopEase/start-dev.bat) to automatically boot both the backend and frontend in separate command windows and open [http://localhost:3000](http://localhost:3000) in your browser.

#### Manual Terminal Commands:
1. **Start PostgreSQL and initialize database:**
   Create a database named `shopease`:
   ```sql
   CREATE DATABASE shopease;
   ```
   Execute the schema and seed scripts:
   ```bash
   psql -U postgres -d shopease -f database/schema.sql
   psql -U postgres -d shopease -f database/seed.sql
   ```

2. **Start Backend Server:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run build
   npm start
   # Or for development with hot reload:
   # npm run dev
   ```
   Backend starts on [http://localhost:5000](http://localhost:5000).

3. **Start Frontend SPA:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Frontend starts on [http://localhost:3000](http://localhost:3000).

---

## 6. Default Test Accounts (For Local QA Testing Only)

> **Security Notice:** The following test credentials are strictly intended for local QA test automation and manual evaluation. Never use real personal passwords.

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shopease.com` | `Admin@123` | Full administrative control, catalog CRUD, order status management |
| **Customer 1** | `customer1@shopease.com` | `Customer@123` | Shopping, cart management, checkout, personal order tracking |
| **Customer 2** | `customer2@shopease.com` | `Customer@123` | Secondary customer account for multi-user isolation verification |
| **Seed Shopper** | `john@example.com` | `Customer@123` | Pre-loaded customer with existing order history in database |

---

## 7. REST API Documentation

All API responses follow a uniform JSON structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful description",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Human-readable failure description",
  "error": { ... }
}
```

### Endpoints Table

| Method | Endpoint | Access Level | Description | Required Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System and database health status | None |
| `POST` | `/api/auth/register` | Public | Register new customer account | `{ name, email, password, confirmPassword }` |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token | `{ email, password }` |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile | None (`Bearer <token>` in header) |
| `GET` | `/api/products` | Public | List products (search, filter, sort, paginate) | Query params: `search`, `category`, `minPrice`, `maxPrice`, `sort` |
| `GET` | `/api/products/categories` | Public | Retrieve distinct product categories | None |
| `GET` | `/api/products/:id` | Public | Retrieve detailed product by ID | None |
| `GET` | `/api/products/:id/reviews` | Public | Retrieve product reviews, average rating & distribution | None |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submit product review & rating (1-5 stars) | `{ rating: number (1-5), comment: string }` |
| `DELETE` | `/api/products/:id/reviews/:reviewId` | Authenticated | Delete own review (or any review as Admin) | None |
| `POST` | `/api/products` | Admin Only | Create new catalog item | `{ name, description, category, price, stock, image }` |
| `PUT` | `/api/products/:id` | Admin Only | Update existing product details | `{ name, description, category, price, stock, image }` |
| `DELETE` | `/api/products/:id` | Admin Only | Delete product from catalog | None |
| `GET` | `/api/cart` | Authenticated | View authenticated user's cart | None |
| `POST` | `/api/cart/items` | Authenticated | Add item to cart with stock validation | `{ productId: number, quantity: number }` |
| `PUT` | `/api/cart/items/:id` | Authenticated | Update quantity of a cart item | `{ quantity: number }` |
| `DELETE` | `/api/cart/items/:id` | Authenticated | Remove single item from cart | None |
| `DELETE` | `/api/cart` | Authenticated | Clear all items from cart | None |
| `POST` | `/api/orders` | Authenticated | Checkout and place order | `{ shippingName, shippingAddress, shippingCity, shippingPostalCode, shippingPhone, paymentMethod }` |
| `GET` | `/api/orders` | Authenticated | Retrieve customer's own order history | None |
| `GET` | `/api/orders/:id` | Authenticated | Retrieve order details (user isolation enforced) | None |
| `POST` | `/api/orders/:id/cancel` | Authenticated | Cancel PENDING order & restore stock | None |
| `GET` | `/api/admin/stats` | Admin Only | Retrieve KPI metrics for dashboard | None |
| `GET` | `/api/admin/orders` | Admin Only | Retrieve all orders across customers | Query param: `status` |
| `PUT` | `/api/admin/orders/:id/status` | Admin Only | Transition order fulfillment status | `{ status: "CONFIRMED" \| "PROCESSING" \| "SHIPPED" \| "DELIVERED" \| "CANCELLED" }` |

---

## 8. Database Architecture & SQL Validation

The PostgreSQL database is normalized to 3NF and includes relational constraints for rigorous database testing:

```text
  [users] 1 ──── 1 [carts] 1 ──── ∞ [cart_items] ∞ ──── 1 [products]
     │
     │ 1
     │
     └─── ∞ [orders] 1 ──── ∞ [order_items] ∞ ──── 0..1 [products]
```

### Key Database Tables
- **`users`**: Primary key `id`, unique `email`, check constraint on `role` (`CUSTOMER` or `ADMIN`).
- **`products`**: Primary key `id`, check `price >= 0`, check `stock >= 0`.
- **`carts` & `cart_items`**: One cart per user; unique constraint on `(cart_id, product_id)`.
- **`orders`**: Stores transaction snapshot and check constraint on status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **`order_items`**: Stores historical `unit_price` at moment of purchase so future price edits do not retroactively alter completed customer receipts.

---

## 9. QA Testability & Automation Selectors (`data-testid`)

All interactive, state-bearing, and critical validation elements expose predictable `data-testid` attributes compatible with **Playwright**, **Cypress**, or **Selenium**.

### Essential Selectors Reference

| Page / Component | Selector | Purpose |
| :--- | :--- | :--- |
| **Navbar** | `data-testid="navbar"` | Navigation container |
| | `data-testid="cart-badge-count"` | Live badge showing total quantity in cart |
| | `data-testid="nav-logout"` | Logout trigger button |
| **Login** | `data-testid="login-email"` | Email input field |
| | `data-testid="login-password"` | Password input field |
| | `data-testid="login-submit"` | Sign-in submission button |
| | `data-testid="login-error"` | Authentication failure alert |
| **Register** | `data-testid="register-name"` | Full name input |
| | `data-testid="register-email"` | Registration email input |
| | `data-testid="register-password"` | Password input |
| | `data-testid="register-confirm-password"` | Password confirmation input |
| | `data-testid="register-submit"` | Register submission button |
| | `data-testid="register-error"` | Registration validation error banner |
| **Catalog** | `data-testid="product-search"` | Search query text input |
| | `data-testid="product-category-filter"` | Category select dropdown |
| | `data-testid="product-min-price"` | Minimum price filter input |
| | `data-testid="product-max-price"` | Maximum price filter input |
| | `data-testid="product-sort"` | Sort order dropdown |
| | `data-testid="product-filter-reset"` | Reset all filters button |
| | `data-testid="product-card"` | Individual product container |
| | `data-testid="product-card-title"` | Product display name |
| | `data-testid="product-card-price"` | Product price label |
| | `data-testid="products-empty-state"` | Empty search results placeholder |
| **Product Details** | `data-testid="product-quantity-input"` | Direct quantity input |
| | `data-testid="product-quantity-decrease"`| Quantity decrement button |
| | `data-testid="product-quantity-increase"`| Quantity increment button |
| | `data-testid="add-to-cart"` | Add product to cart button |
| **Reviews & Ratings** | `data-testid="reviews-section"` | Overall reviews and ratings section |
| | `data-testid="reviews-average-score"` | Average rating number (e.g. 4.8) |
| | `data-testid="reviews-total-count"` | Count of customer reviews |
| | `data-testid="review-form"` | Customer review submission form |
| | `data-testid="review-rating-select"` | Interactive star rating picker (1-5) |
| | `data-testid="review-comment-input"` | Review text comment textarea |
| | `data-testid="review-submit-btn"` | Submit review button |
| | `data-testid="review-card"` | Individual customer review card |
| | `data-testid="review-delete-btn"` | Delete review button |
| **Cart** | `data-testid="cart-container"` | Shopping cart container |
| | `data-testid="cart-item"` | Individual cart line item |
| | `data-testid="cart-item-remove"` | Remove item button |
| | `data-testid="cart-subtotal"` | Subtotal calculation label |
| | `data-testid="cart-total"` | Total price label |
| | `data-testid="cart-checkout-button"` | Proceed to checkout button |
| | `data-testid="cart-empty-state"` | Empty cart container |
| **Checkout** | `data-testid="checkout-name"` | Shipping full name |
| | `data-testid="checkout-address"` | Street address |
| | `data-testid="checkout-city"` | City |
| | `data-testid="checkout-postal-code"` | Postal code |
| | `data-testid="checkout-phone"` | Phone number |
| | `data-testid="checkout-payment-method"`| Simulated payment selector |
| | `data-testid="checkout-submit"` | Place order button |
| **Order Confirmation**| `data-testid="order-success-id"` | Confirmed order ID |
| | `data-testid="order-success-total"` | Confirmed total amount |
| **Admin Dashboard** | `data-testid="admin-stat-revenue"` | Total store revenue KPI |
| | `data-testid="admin-stat-orders"` | Total store orders KPI |
| | `data-testid="admin-product-add-button"`| Add new product trigger |
| **Admin Orders** | `data-testid="admin-order-status-select"`| Inline status change dropdown |
| | `data-testid="admin-order-update-submit"`| Save status change button |

---

## 10. Future QA Testing Plan

The QA Engineer will execute the following validation phases against this testbed:

1. **Manual Exploratory & Functional Testing:**
   - Boundary Value Analysis (BVA) on quantities, prices, and postal codes.
   - Equivalence Partitioning (EP) on authentication credentials and email formats.
   - Cross-role authorization tests (verifying Customer receives `403 Forbidden` on Admin endpoints).
2. **REST API Testing (Postman):**
   - Positive and negative API test collections.
   - Schema validation, token expiration handling, and boundary assertions.
3. **Database Integrity Testing (PostgreSQL SQL):**
   - Validating inventory stock decrements after checkout.
   - Verifying stock rollbacks when orders are cancelled.
   - Verifying cascade deletions and foreign key integrity.
4. **UI Automation Testing (Playwright):**
   - End-to-end user checkout journey (`Register → Add to Cart → Checkout → Verify Order`).
   - Admin fulfillment workflow (`Login → Update Status → Verify Customer View`).
   - Page Object Model (POM) test architecture.

---

## 11. Known Limitations (By Design)

- **Simulated Payment Gateway:** For portfolio testing safety, financial payments are simulated. No real payment provider (Stripe/PayPal) is integrated.
- **Local Email Dispatch:** Account activation emails are bypassed in favor of immediate JWT generation to streamline automated test execution.

---

## 12. License & Author

Engineered as a clean, production-grade Software Quality Assurance portfolio application.
All rights reserved © 2026 ShopEase Platform.

