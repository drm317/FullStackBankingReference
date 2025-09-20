# API Documentation

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-backend-url.azurecontainerapps.io/api`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Accounts

#### Get User Accounts
```http
GET /accounts
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "account-id-1",
    "userId": "user-id",
    "accountNumber": "ACC1234567890123",
    "accountType": "checking",
    "balance": 1000.00,
    "currency": "USD",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "_id": "account-id-2",
    "userId": "user-id",
    "accountNumber": "ACC1234567890124",
    "accountType": "savings",
    "balance": 5000.00,
    "currency": "USD",
    "status": "active",
    "interestRate": 0.02,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Get Account Details
```http
GET /accounts/:accountId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "account-id",
  "userId": "user-id",
  "accountNumber": "ACC1234567890123",
  "accountType": "checking",
  "balance": 1000.00,
  "currency": "USD",
  "status": "active",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Get Account Transactions
```http
GET /accounts/:accountId/transactions?page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of transactions per page (default: 20)

**Response:**
```json
{
  "transactions": [
    {
      "_id": "transaction-id",
      "fromAccountId": "account-id-1",
      "toAccountId": "account-id-2",
      "amount": 100.00,
      "currency": "USD",
      "type": "transfer",
      "description": "Monthly savings",
      "status": "completed",
      "reference": "TXN1640995200000123",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Transactions

#### Transfer Money
```http
POST /transactions/transfer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fromAccountId": "account-id-1",
  "toAccountId": "account-id-2",
  "amount": 100.00,
  "description": "Transfer to savings"
}
```

**Response:**
```json
{
  "message": "Transfer completed successfully",
  "transaction": {
    "_id": "transaction-id",
    "fromAccountId": "account-id-1",
    "toAccountId": "account-id-2",
    "amount": 100.00,
    "currency": "USD",
    "type": "transfer",
    "description": "Transfer to savings",
    "status": "completed",
    "reference": "TXN1640995200000123",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Deposit Money
```http
POST /transactions/deposit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "accountId": "account-id",
  "amount": 500.00,
  "description": "Salary deposit"
}
```

**Response:**
```json
{
  "message": "Deposit completed successfully",
  "transaction": {
    "_id": "transaction-id",
    "toAccountId": "account-id",
    "amount": 500.00,
    "currency": "USD",
    "type": "deposit",
    "description": "Salary deposit",
    "status": "completed",
    "reference": "TXN1640995200000124",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Withdraw Money
```http
POST /transactions/withdraw
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "accountId": "account-id",
  "amount": 200.00,
  "description": "ATM withdrawal"
}
```

**Response:**
```json
{
  "message": "Withdrawal completed successfully",
  "transaction": {
    "_id": "transaction-id",
    "fromAccountId": "account-id",
    "amount": 200.00,
    "currency": "USD",
    "type": "withdrawal",
    "description": "ATM withdrawal",
    "status": "completed",
    "reference": "TXN1640995200000125",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Health Check

#### Application Health
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Validation Errors

When validation fails, the response includes detailed error information:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Invalid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

## Security Considerations

1. **HTTPS Only**: All production API calls must use HTTPS
2. **Token Expiration**: JWT tokens expire after 24 hours
3. **Input Validation**: All inputs are validated and sanitized
4. **SQL Injection Protection**: Using MongoDB with parameterized queries
5. **XSS Protection**: Helmet middleware provides security headers
6. **CORS**: Configured for specific origins only

## Example Usage

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get accounts
const accounts = await api.get('/accounts');

// Transfer money
const transfer = await api.post('/transactions/transfer', {
  fromAccountId: 'account-1',
  toAccountId: 'account-2',
  amount: 100,
  description: 'Transfer'
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get accounts
curl -X GET http://localhost:3001/api/accounts \
  -H "Authorization: Bearer your-jwt-token"

# Transfer money
curl -X POST http://localhost:3001/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"fromAccountId":"account-1","toAccountId":"account-2","amount":100,"description":"Transfer"}'
```