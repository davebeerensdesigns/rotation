# Rotation Project

This monorepo contains both the client and server applications for the **Rotation** project.

## Project Overview

**Rotation** is a simple full-stack web application that demonstrates secure Web3 authentication using Sign-In with
Ethereum (SIWE) from Reown, session management with rotating JWT access tokens and refresh token, and a decoupled
microservice-style architecture.

## Project Structure

```
rotation/
├── client/       # Next.js frontend with Web3 SIWE auth
├── server/       # Node.js Express backend with JWT & MongoDB
└── .gitignore    # Monorepo-level gitignore
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for the server)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/davebeerensdesigns/rotation.git
cd rotation
```

### 2. Environment Variables

Make sure to set up the following `.env` files:

#### client/.env

```
NEXT_PUBLIC_PROJECT_ID=<your-project-id-from-reown>
NEXTAUTH_SECRET=<a-random-string>
DOMAIN=<your-domain>
```

#### server/.env

```
PORT=3001
JWT_SECRET=<a-random-string>
REFRESH_SECRET=<a-random-string>
ACCESS_TOKEN_EXPIRY=600
REFRESH_TOKEN_EXPIRY=604800
MONGODB_URI=<mongo-db-connection-url>
DB_NAME=<a-db-name>
CORS_ORIGIN=<client-url>
```

### 3. Install Dependencies

#### Client

```bash
cd client
npm install
```

#### Server

```bash
cd ../server
npm install
```

### 4. Run the Applications

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
cd ../client
npm run dev
```

## Deployment

Make sure to configure your environment variables in your deployment platform.

## License

This project is licensed under the MIT License.
