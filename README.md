# SupplyChainTracking

A simple blockchain-based supply chain tracking application built with Solidity and a static HTML/CSS/JavaScript frontend. The project stores product registration and shipment updates on Ethereum Sepolia, then exposes them through a role-aware web interface for admins, manufacturers, distributors, and read-only users.

## Overview

This project is designed to make product movement more transparent across a supply chain. Each product is registered on-chain with a unique ID, origin, destination, quantity, company, notes, and status. As the shipment moves, authorized users can update the product's location and delivery status. Every change is written to the smart contract and preserved in the product's history log.

The frontend connects to MetaMask, reads the connected wallet's role from the contract, and shows only the pages/actions that wallet is allowed to use.

Deployed contract on Sepolia Test Net:

`0x6Aab135dC8e3720B2F1A720094cD2a3AA7763ef7`

## Features

- Role-based access control on-chain
- Product creation with unique product IDs
- Product location and status updates
- Full product tracking and movement history
- Product listing dashboard with summary metrics
- Wallet-based role detection through MetaMask
- Static frontend with no backend server required
- Sepolia testnet integration

## Tech Stack

- Smart contract: Solidity `^0.8.20`
- Network: Ethereum Sepolia testnet
- Frontend: HTML, CSS, vanilla JavaScript
- Web3 library: `ethers.js` loaded in the browser
- Wallet: MetaMask

## How It Works

The application has two main parts:

1. `contract/SupplyChain.sol`
   This smart contract stores user roles, product data, and each product's update history.

2. `frontend/`
   This is the client interface. It connects to MetaMask, talks directly to the deployed smart contract, and renders different UI panels based on the current wallet's role.

There is no backend in this repository. All persistent data lives on-chain.

## Roles And Permissions

The contract defines four roles:

### 1. Admin

Can:

- Create products
- Update products
- Track products
- View all products
- Assign or change user roles

### 2. Manufacturer

Can:

- Create products
- Track products
- View all products

Status values manufacturer can set:

- `Menunggu`
- `Di Gudang`
- `Siap Diambil`

### 3. Distributor

Can:

- Update products
- Track products
- View all products

Status values distributor can set:

- `Diambil Distributor`
- `Dalam Transit`
- `Terkirim`

### 4. None

Can:

- Track products
- View all products

## Product Lifecycle

When a product is first created, the contract automatically sets its initial status to:

- `Menunggu`

The valid system statuses are:

- `Menunggu`
- `Di Gudang`
- `Siap Diambil`
- `Diambil Distributor`
- `Dalam Transit`
- `Terkirim`

Each update stores:

- Timestamp
- Location
- Status
- Human-readable update description

## Project Structure

```text
SupplyChainTracking/
├── README.md
├── contract/
│   └── SupplyChain.sol
├── artifacts/
│   ├── SupplyChain.json
│   ├── SupplyChain_metadata.json
│   └── build-info/
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## Smart Contract Summary

The smart contract stores:

- A mapping of wallet address to role
- A mapping of product ID to product data
- A mapping of product ID to an array of history records
- An array of all registered product IDs

Main contract capabilities:

- `setUserRole(address, Role)` assigns a user role
- `getMyRole()` returns the caller's role
- `getRoleName(address)` returns a role label
- `createProduct(...)` creates a new product
- `updateProduct(...)` updates a product's location and/or status
- `getProduct(id)` returns one product
- `getProductHistoryCount(id)` returns number of history entries
- `getProductHistoryItem(id, index)` returns one history record
- `getAllProductIds()` returns all stored product IDs
- `getProductCount()` returns the total number of products
- `productExists(id)` checks whether a product exists

## Frontend Summary

The frontend provides these main views:

- Create Product
- Update Product
- Track Product
- All Products
- Role Management

Important frontend behavior:

- Reads the connected wallet from MetaMask
- Detects the wallet role from the contract
- Shows or hides panels based on that role
- Warns users if they are not on Sepolia
- Loads all products directly from blockchain data
- Displays product history as a timeline

The deployed contract address is hardcoded in [frontend/js/app.js](frontend/js/app.js).

## Prerequisites

Before running the project, make sure you have:

- MetaMask installed in your browser
- Access to the Sepolia testnet in MetaMask
- Sepolia ETH for sending transactions if you want to create products, update products, or assign roles

## Running The Project

This repository does not currently include a build pipeline, local blockchain setup, deployment script, or package manifest. The frontend is a static site, so the simplest way to run it is through a local static server.

## Usage Flow

### Admin Flow

1. Connect MetaMask with the wallet that has the `Admin` role.
2. Open the Role Management page to assign roles to other wallets if needed.
3. Register products using the Create Product form.
4. Update products or monitor shipment progress from the dashboard.

### Manufacturer Flow

1. Connect MetaMask with a wallet assigned as `Manufacturer`.
2. Create a product with product details and shipping destination.

### Distributor Flow

1. Connect MetaMask with a wallet assigned as `Distributor`.
2. Search for the product by ID or name.
3. Update shipment location and delivery status.

### Public Or Unassigned User Flow

1. Connect any wallet, or browse as a wallet with no assigned role.
2. Use tracking and product listing features in read-only mode.

## Example Product Data

Example values you can use in the UI:

- Product ID: `PRD-2026-001`
- Product Name: `Beras Premium 5kg`
- Origin: `Gudang Surabaya`
- Destination: `Gudang Jakarta Selatan`
- Quantity: `500`
- Company: `PT Maju Bersama`
- Notes: `Pengiriman batch April`

## Notes About Deployment

This repository already contains:

- The Solidity smart contract source
- Contract artifacts
- A frontend configured to use the deployed Sepolia contract

This repository does not currently contain:

- Hardhat configuration
- Truffle configuration
- Foundry configuration
- Deployment scripts
- Automated tests
- A package manifest such as `package.json`