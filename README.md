# StockFlow — Full-Stack Inventory Management System

A high-performance, modern Inventory Management Application built with a **React 19 + TypeScript** frontend, powered by **Tailwind CSS**, **Lucide Icons**, and **Chart.js**, backed by a resilient **Node.js 24 + Express 5** server and built-in **SQLite** database with WAL mode and atomic transactions.

---

## 🌟 Key Features

### 1. **Live Analytics & KPI Dashboard**
- **Catalog Metrics**: Total catalog items, units in stock, healthy stock status indicators.
- **Valuation Intelligence**: Real-time Total Retail Valuation, Total Inventory Acquisition Cost, and Estimated Gross Profit Margin.
- **Attention Needed Counter**: Real-time count of Low Stock (approaching threshold) and Out of Stock (0 units) items with one-click filter actions.
- **Visual Analytics**: Interactive doughnut chart for Category Value Distribution and 14-day Inflow vs. Outflow movement bar charts powered by Chart.js.
- **Recent Movements Timeline**: Live feed of recent stock receipts and dispatches.

### 2. **Product Catalog Management**
- Complete CRUD (Create, Read, Update, Delete) for inventory items.
- Fields: SKU, Name, Category, Supplier, Description, Unit of Measure, Cost Price, Selling Price, Quantity, Low Stock Alert Threshold, Warehouse Bin/Shelf Location, and Barcode/UPC.
- Auto SKU generator with custom or category-based prefixes.
- Profit margin and markup percentage calculated dynamically as you type.
- Multi-dimensional search & filtering: Instant text search across names, SKUs, locations, and barcodes; category and supplier dropdown filters; stock health status filters; multi-column sorting.
- View switch: Seamless toggle between Detailed Table View and Visual Product Cards Grid.

### 3. **Transactional Stock In / Out / Adjust Engine**
- **Stock In (Receiving)**: Log purchase orders and supplier deliveries with reference numbers and unit costs.
- **Stock Out (Dispatch)**: Log customer order dispatches, sales fulfillment, and damaged goods write-offs with automatic insufficient-stock prevention.
- **Physical Audit / Adjustment**: Reconcile discrepancies from physical warehouse counts.
- **Safety**: Atomic SQLite transactions with automatic rollback on error.

### 4. **Immutable Audit Trail Ledger (Movements)**
- Full audit log of every quantity change with previous balance, new balance, change delta, transaction type, reason notes, reference numbers (e.g. `PO-102`, `INV-889`), performed-by user, and timestamp.
- Search and filter by movement type (IN, OUT, ADJUST) and keywords.

### 5. **Categories & Suppliers Directory**
- Manage merchandise categories with live product count and aggregate inventory value.
- Supplier address book with contact persons, emails, phones, and warehouse hubs.

### 6. **Data Export & Demo Controls**
- One-click CSV export for the Product Catalog.
- One-click CSV export for the Movements Audit Ledger.
- One-click "Reset Demo Data" to instantly seed realistic sample products (Electronics, Furniture, Stationery, Pantry supplies).

---

## 🏗️ Architecture & Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS v4 + `@tailwindcss/vite`
  - Lucide React Icons
  - Chart.js for data visualization
  - Built with Vite 6/8 to `c:\inventory\public`
- **Backend**:
  - Node.js 24 + Express 5
  - Native `node:sqlite` (`DatabaseSync`) — zero native C++ compilation needed, blazing fast synchronous SQL operations, WAL (Write-Ahead Logging) journal mode, foreign key constraints, and transactional consistency.
- **API**:
  - Clean RESTful design with structured JSON responses.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.5.0 or higher, v24 recommended)
- npm

### Installation & Launch

1. Start the server (serves the React production build at `http://localhost:5000`):
   ```bash
   npm start
   ```

2. Open your browser and visit:
   ```
   http://localhost:5000
   ```

### Client Development with Hot Module Replacement (HMR)

If you wish to run the Vite dev server with instant HMR:
```bash
npm run dev:client
```
*(Runs Vite on `http://localhost:3000` with automated proxying of `/api` requests to `http://localhost:5000`)*

To re-build the React production bundle:
```bash
npm run build
```

---

## 🧪 Running Automated Tests

Run the end-to-end API test suite:
```bash
npm test
```

---

## 📁 Project Structure

```
c:\inventory\
├── client\                   # React 19 + TypeScript Frontend (Vite)
│   ├── src\
│   │   ├── components\       # UI Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── ProductsView.tsx
│   │   │   ├── MovementsView.tsx
│   │   │   ├── CategoriesView.tsx
│   │   │   ├── SuppliersView.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   ├── QuickAdjustModal.tsx
│   │   │   ├── ProductDetailModal.tsx
│   │   │   ├── CategoryModal.tsx
│   │   │   ├── SupplierModal.tsx
│   │   │   └── Toast.tsx
│   │   ├── services\
│   │   │   └── api.ts        # Typed API service client
│   │   ├── types\
│   │   │   └── inventory.ts  # TypeScript type definitions
│   │   ├── App.tsx           # Main application state & routing
│   │   ├── main.tsx          # React DOM root entry
│   │   └── index.css         # Tailwind CSS imports
│   ├── vite.config.ts        # Vite config with proxy & build target
│   └── package.json
├── data\
│   └── inventory.db          # SQLite Database (WAL mode enabled)
├── database\
│   └── db.js                 # node:sqlite configuration, schema, seeding & transactions
├── routes\
│   ├── dashboard.js          # KPI metrics & analytics aggregation
│   ├── products.js           # Product CRUD & stock adjustment endpoints
│   ├── movements.js          # Audit trail movements ledger endpoints
│   ├── categories.js         # Category management endpoints
│   ├── suppliers.js          # Supplier directory endpoints
│   └── export.js             # CSV export & demo reset endpoints
├── public\                   # Compiled React bundle served by Express
├── server.js                 # Express server & static asset host
├── test-api.js               # Automated verification test script
└── package.json              # Project scripts
```
