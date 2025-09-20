# Full Stack Banking Application

A full-stack banking reference application built with Node.js, React, MongoDB, and deployed on Azure. This project demonstrates modern web development practices, security patterns, and cloud deployment strategies.

## Features

### Backend (Node.js + Express + TypeScript)
- **Authentication & Authorization**: JWT-based authentication with secure password hashing
- **Account Management**: Multiple account types (checking, savings, credit)
- **Transaction Processing**: Secure money transfers, deposits, and withdrawals
- **Database**: MongoDB with Mongoose ODM and atomic transactions
- **Security**: Rate limiting, input validation, CORS protection, helmet middleware
- **API Documentation**: RESTful API with comprehensive error handling

### Frontend (React + TypeScript)
- **Modern UI**: Responsive design with Tailwind CSS
- **Dashboard**: Account overview with real-time balances
- **Transaction Management**: Transfer money between accounts with form validation
- **Account Details**: Transaction history with pagination
- **Authentication**: Secure login/registration with form validation
- **State Management**: Context API for authentication state

### Database (MongoDB)
- **User Management**: Secure user profiles with encrypted passwords
- **Account System**: Multi-account support per user
- **Transaction Ledger**: Complete transaction history with references
- **Indexes**: Optimized queries for performance

### Deployment (Azure)
- **Container Apps**: Scalable microservices architecture
- **Container Registry**: Private Docker image storage
- **Infrastructure as Code**: Bicep templates for reproducible deployments
- **Monitoring**: Application Insights and Log Analytics
- **Security**: Private networking and secure secrets management

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Frontend│◄──►│  Node.js API    │◄──►│   MongoDB       │
│   (Port 3000)   │    │  (Port 3001)    │    │   (Port 27017)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7+
- Docker and Docker Compose
- Azure CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd banking-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   
   Update the environment files with your configuration.

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d --name mongodb -p 27017:27017 mongo:7
   
   # Or using Docker Compose
   docker-compose up mongodb -d
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run backend:dev  # Backend on http://localhost:3001
   npm run frontend:dev # Frontend on http://localhost:3000
   ```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Accounts
- `GET /api/accounts` - Get user accounts
- `GET /api/accounts/:id` - Get account details
- `GET /api/accounts/:id/transactions` - Get account transactions

### Transactions
- `POST /api/transactions/transfer` - Transfer money between accounts
- `POST /api/transactions/deposit` - Deposit money
- `POST /api/transactions/withdraw` - Withdraw money

### Health Check
- `GET /health` - Application health status

## Testing

```bash
# Run backend tests
npm run backend:test

# Run frontend tests
npm run frontend:test

# Run all tests
npm run test
```

## Deployment to Azure

### Prerequisites
- Azure subscription
- Azure CLI installed and logged in
- Docker installed

### Deploy Infrastructure

1. **Navigate to infrastructure directory**
   ```bash
   cd infrastructure/azure
   ```

2. **Run deployment script**
   ```bash
   ./deploy.sh
   ```
   
   The script will:
   - Create Azure resource group
   - Deploy infrastructure using Bicep templates
   - Build and push Docker images to Azure Container Registry
   - Deploy container apps
   - Configure networking and security

### Manual Deployment Steps

1. **Create resource group**
   ```bash
   az group create --name fullstack-reference-rg --location eastus
   ```

2. **Deploy infrastructure**
   ```bash
   az deployment group create \
     --resource-group fullstack-reference-rg \
     --template-file main.bicep \
     --parameters environment=prod
   ```

3. **Build and push images**
   ```bash
   # Login to ACR
   az acr login --name <registry-name>
   
   # Build and push backend
   docker build -t <registry>.azurecr.io/banking-backend:latest ./backend
   docker push <registry>.azurecr.io/banking-backend:latest
   
   # Build and push frontend
   docker build -t <registry>.azurecr.io/banking-frontend:latest ./frontend
   docker push <registry>.azurecr.io/banking-frontend:latest
   ```

## Security Features

- **Authentication**: JWT tokens with secure secret management
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Express-validator for all API endpoints
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express applications
- **MongoDB Security**: Connection string encryption and user authentication
- **Container Security**: Non-root user execution and minimal attack surface

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/fullstack_reference
JWT_SECRET=your-super-secret-jwt-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Project Structure

```
fullstack-reference/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── database/               # Database configuration
│   └── init-mongo.js       # MongoDB initialization
├── infrastructure/         # Azure deployment
│   └── azure/
│       ├── main.bicep      # Infrastructure template
│       └── deploy.sh       # Deployment script
├── docker-compose.yml      # Local development
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Two-factor authentication
- [ ] Account statements and reports
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with external banking APIs
- [ ] Notification system
- [ ] Multi-currency support