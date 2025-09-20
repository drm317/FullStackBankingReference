// MongoDB initialization script
db = db.getSiblingDB('banking');

// Create collections
db.createCollection('users');
db.createCollection('accounts');
db.createCollection('transactions');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

// Create indexes for accounts collection
db.accounts.createIndex({ "userId": 1 });
db.accounts.createIndex({ "accountNumber": 1 }, { unique: true });
db.accounts.createIndex({ "accountType": 1 });
db.accounts.createIndex({ "status": 1 });

// Create indexes for transactions collection
db.transactions.createIndex({ "fromAccountId": 1 });
db.transactions.createIndex({ "toAccountId": 1 });
db.transactions.createIndex({ "reference": 1 }, { unique: true });
db.transactions.createIndex({ "createdAt": -1 });
db.transactions.createIndex({ "type": 1 });
db.transactions.createIndex({ "status": 1 });

// Create compound indexes
db.transactions.createIndex({ "fromAccountId": 1, "createdAt": -1 });
db.transactions.createIndex({ "toAccountId": 1, "createdAt": -1 });

print('Banking database initialized with collections and indexes');