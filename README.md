# 🛒 ShopKart — Modern Full-Stack E-Commerce Platform

A production-grade, full-stack E-Commerce application built using the **MERN Stack** (MongoDB, Express, React 19, Node.js), styled with **Tailwind CSS v4**, and integrated with **Razorpay Payment Gateway** for secure checkout transactions.

---

## 📑 Table of Contents

- [Project Architecture](#-project-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Project](#-running-the-project)
- [Automated Backend Test Suites](#-automated-backend-test-suites)
- [API Reference](#-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏗 Project Architecture

ShopKart is architected as a decoupled client-server application:

```
┌─────────────────────────────────┐        ┌──────────────────────────────────┐
│   shopkart-frontend (Vite SPA)  │        │       backend (Express REST)     │
│   • React 19 + Tailwind CSS v4  │        │   • Express 5.2 + Mongoose 9     │
│   • React Router v7             │◄──────►│   • JWT Auth (Bearer + HttpOnly) │
│   • Axios (with Interceptors)   │  HTTP  │   • Razorpay SDK + Verification  │
│   • Cart & Wishlist Context/Sync│        │   • In-Memory Mongo Fallback     │
└─────────────────────────────────┘        └──────────────────────────────────┘
                 │                                           │
                 │                                           ▼
                 ▼                                 ┌──────────────────┐
      ┌─────────────────────┐                      │  MongoDB Database│
      │ Razorpay Checkout UI│                      │  (Atlas / Local) │
      └─────────────────────┘                      └──────────────────┘
```

---

## ✨ Key Features

- **🔐 Robust Authentication & Security**:
  - Secure registration, login, logout, and profile fetch.
  - Bcrypt hashed passwords and JWT token verification.
  - Dual-token support: HTTP Bearer header authorization and HttpOnly cookies.
  - Change password workflow with old password verification.
- **📦 Dynamic Product Catalog**:
  - Automated database seeding with sample products on first boot.
  - Case-insensitive search query matching.
  - Category filtering and price sorting (`price_asc`, `price_desc`).
  - Stock validation and real-time inventory indicators.
- **❤️ Wishlist Management**:
  - Add, remove, and toggle items in wishlist.
  - Live navbar badge count synchronized via custom event bus.
  - "Move to Cart" one-click action.
- **🛍️ Intelligent Shopping Cart**:
  - Add to cart with automated stock upper-bound limits.
  - Increment / decrement quantity with automatic subtotal calculation.
  - Isolated loading spinners for individual item actions.
- **💳 End-to-End Razorpay Checkout & Verification**:
  - Full shipping address validation (10-digit phone, 6-digit PIN code).
  - Server-side order generation and inventory availability check.
  - Secure HMAC SHA-256 signature verification.
  - Built-in test simulator fallback for zero-friction lab testing.
  - Automatic inventory decrement and cart cleanup upon payment success.
- **📋 Order Lifecycle & Tracking**:
  - Historic order snapshots preserving prices and product states.
  - Dedicated order tracking page with visual delivery timeline:
    `PENDING_PAYMENT` ➔ `PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`.
- **🛡️ 3-Tier Database Resilience**:
  - Automatically falls back from **MongoDB Atlas** ➔ **Local MongoDB** ➔ **Embedded In-Memory MongoDB Server** (`mongodb-memory-server`) if external connections are unreachable.

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose 9.x
- **In-Memory Fallback**: `mongodb-memory-server`
- **Authentication**: `jsonwebtoken`, `bcrypt`, `cookie-parser`
- **Payment Processing**: `razorpay`, Node.js `crypto`
- **CORS**: `cors` with dynamic localhost origin resolution

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios with request/response interceptors
- **Linter**: Oxlint

---

## 📋 Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster. (If unavailable, the backend automatically boots an in-memory database).

---

## 🚀 Getting Started & Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd "sst group'c' webdev/mern/project1"
```

---

### 2. Backend Setup

1. Open a terminal and navigate into the `backend` folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env`)*

4. Populate your `backend/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopkart
   JWT_SECRET=super_secret_jwt_key_shopkart_2026
   RAZORPAY_KEY_ID=rzp_test_shopkart10135
   RAZORPAY_KEY_SECRET=shopkart_secret_key_lab06
   ```

---

### 3. Frontend Setup

1. Open a second terminal window and navigate into the `shopkart-frontend` folder:
   ```bash
   cd shopkart-frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Create a `.env` file for frontend if connecting to a custom backend URL:
   ```env
   # By default in development, Vite proxies requests to http://localhost:5000
   # Leave empty or set to http://localhost:5000
   VITE_API_URL=
   ```

---

## 🏃 Running the Project

### Start the Backend Server

Inside the `backend/` directory:
```bash
# Using nodemon for auto-reload on code change
npm run dev

# Or using standard node
npm start
```
The backend server will run on: **`http://localhost:5000`**

### Start the Frontend Client

Inside the `shopkart-frontend/` directory:
```bash
npm run dev
```
The frontend Vite server will be accessible at: **`http://localhost:5173`**

Open `http://localhost:5173` in your browser to start using ShopKart.

---

## 🧪 Automated Backend Test Suites

The backend comes with pre-configured standalone test suites to validate API contracts, authentication guards, and checkout flows without needing third-party tools.

Ensure the backend server is running on `http://localhost:5000`, then run in the `backend/` directory:

1. **Test Shopping Cart APIs**:
   ```bash
   node test_cart.js
   ```
   *Validates unauthenticated rejection, user registration, stock upper bounds, quantity updates, and cart item deletion.*

2. **Test Wishlist APIs**:
   ```bash
   node test_wishlist.js
   ```
   *Validates wishlist toggles, unique constraints, and badge count endpoints.*

3. **Test Orders & Razorpay Checkout**:
   ```bash
   node test_order.js
   ```
   *Validates order generation, HMAC SHA-256 signature verification, stock decrements, and status progression.*

---

## 📡 API Reference

### 👤 Customer Endpoints (`/customers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers/register` | Public | Register a new customer |
| `POST` | `/customers/login` | Public | Login and obtain JWT token |
| `GET` | `/customers/me` | Protected | Fetch current logged-in customer profile |
| `POST` | `/customers/logout` | Protected | Logout user & clear auth cookies |
| `PATCH`| `/customers/change-password` | Protected | Change existing account password |

### 🛍️ Product Catalog (`/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Fetch all products (supports `?search=`, `?category=`, `?sort=`) |
| `GET` | `/products/:id` | Public | Fetch product details by ID |
| `POST` | `/products` | Public | Create new product in catalog |

### ❤️ Wishlist Endpoints (`/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/wishlist` | Protected | Get all wishlist items for current user |
| `GET` | `/wishlist/count` | Protected | Fast total count lookup for badges |
| `POST` | `/wishlist/:productId` | Protected | Add product to wishlist |
| `DELETE`| `/wishlist/:productId` | Protected | Remove product from wishlist |
| `PATCH`| `/wishlist/:productId/toggle` | Protected | Single-click add/remove toggle |

### 🛒 Cart Endpoints (`/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Protected | Get populated user cart and subtotal |
| `POST` | `/cart/:productId` | Protected | Add item to cart / increment quantity |
| `PATCH`| `/cart/:productId` | Protected | Update quantity (`{ quantity: N }`) |
| `DELETE`| `/cart/:productId` | Protected | Remove product from cart |
| `DELETE`| `/cart` | Protected | Clear entire cart |

### 💳 Order & Payment Endpoints (`/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/create-payment-order` | Protected | Validate cart, verify stock, create Razorpay order |
| `POST` | `/orders/verify-payment` | Protected | Verify HMAC-SHA256 signature, decrement inventory, clear cart |
| `GET` | `/orders` | Protected | List all orders placed by the user |
| `GET` | `/orders/:id` | Protected | Get single order details (ownership protected) |
| `PATCH`| `/orders/:id/status` | Protected | Update order lifecycle status |

---

## 📁 Project Directory Structure

```
.
├── backend/
│   ├── config/
│   │   └── razorpay.js            # Razorpay client initialization
│   ├── controllers/
│   │   ├── cart.controller.js     # Cart logic & stock ceiling validation
│   │   ├── customer.controller.js # Auth, registration, profile & password
│   │   ├── order.controller.js    # Razorpay orders, HMAC verification & stock decrement
│   │   ├── product.controller.js  # Catalog filters, sorting & seeding
│   │   └── wishlist.controller.js # Wishlist toggling and count
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT Bearer and Cookie authentication guard
│   ├── models/
│   │   ├── customer.model.js      # Customer schema with embedded cart & wishlist
│   │   ├── order.model.js         # Order schema with snapshot items & status enum
│   │   ├── product.model.js       # Product schema with price/stock validators
│   │   └── user.model.js          # Model alias
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── utils/
│   │   └── generateToken.js       # JWT generation and cookie setter
│   ├── test_cart.js               # Standalone cart test runner
│   ├── test_order.js              # Standalone order test runner
│   ├── test_wishlist.js           # Standalone wishlist test runner
│   ├── index.js                   # Express server entry point & DB fallback
│   ├── package.json
│   └── .env.example
│
└── shopkart-frontend/
    ├── public/                    # Static assets
    ├── src/
    │   ├── components/
    │   │   ├── CartItem.jsx       # Cart row component with quantity stepper
    │   │   ├── Navbar.jsx         # Sticky navigation with live badge counts
    │   │   ├── ProductCard.jsx    # Card with heart toggle & quick add-to-cart
    │   │   ├── SearchBar.jsx      # Instant query filter input
    │   │   └── WishlistCard.jsx   # Wishlist item card with move-to-cart
    │   ├── context/
    │   │   └── CartContext.jsx    # Global cart state & optimistic UI handlers
    │   ├── pages/
    │   │   ├── Cart.jsx           # Cart page with price summary
    │   │   ├── Checkout.jsx       # Address form, Razorpay SDK & test simulator
    │   │   ├── Home.jsx           # Landing page with hero banner & highlights
    │   │   ├── Login.jsx          # Login screen
    │   │   ├── OrderDetails.jsx   # Order tracker with timeline
    │   │   ├── Orders.jsx         # User order history
    │   │   ├── OrderSuccess.jsx   # Order receipt confirmation
    │   │   ├── ProductDetails.jsx # In-depth product view
    │   │   ├── Products.jsx       # Catalog page with filters & search
    │   │   ├── Register.jsx       # Account registration
    │   │   └── Wishlist.jsx       # Saved products dashboard
    │   ├── services/
    │   │   └── api.js             # Axios instance with credentials & token injection
    │   ├── App.jsx                # Route definitions & auth initialization
    │   ├── main.jsx               # React entry point
    │   └── index.css              # Tailwind CSS imports & theme styling
    ├── vite.config.js             # Vite proxy configuration for backend endpoints
    └── package.json
```

---

## ❓ Troubleshooting & FAQs

### 1. MongoDB fails to connect or times out
- **No action needed!** The backend is equipped with an automatic 3-tier fallback. If your local MongoDB or Atlas cluster is unreachable, it automatically initializes an in-memory database (`mongodb-memory-server`) and seeds initial sample products.

### 2. Payments in Lab / Test Environment
- When running in simulation or test mode without live Razorpay keys, the frontend will automatically display the **interactive Test Simulator modal** allowing you to simulate both successful and failed payment responses seamlessly.

### 3. CORS or Unauthorized Errors
- Vite's dev server includes a pre-configured proxy (`vite.config.js`) routing `/customers`, `/products`, `/wishlist`, `/cart`, and `/orders` directly to `http://localhost:5000`. Ensure both backend (`5000`) and frontend (`5173`) are running concurrently.

---

## 📄 License

This project is licensed under the ISC License.
