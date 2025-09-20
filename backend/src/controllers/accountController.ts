import { Response } from 'express';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await Account.find({ userId: req.user!._id }).select('-__v');
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    }).select('-__v');
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAccountTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const transactions = await Transaction.find({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('fromAccountId', 'accountNumber accountType')
    .populate('toAccountId', 'accountNumber accountType');

    const total = await Transaction.countDocuments({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    });

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get account transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};