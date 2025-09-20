import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export const transferValidation = [
  body('fromAccountId').isMongoId(),
  body('toAccountId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().isLength({ min: 1, max: 500 })
];

export const depositValidation = [
  body('accountId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().isLength({ min: 1, max: 500 })
];

export const withdrawValidation = [
  body('accountId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().isLength({ min: 1, max: 500 })
];

export const transfer = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (fromAccountId === toAccountId) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    const [fromAccount, toAccount] = await Promise.all([
      Account.findOne({ _id: fromAccountId, userId: req.user!._id }).session(session),
      Account.findById(toAccountId).session(session)
    ]);

    if (!fromAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Source account not found or not owned by user' });
    }

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Destination account not found' });
    }

    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'One or both accounts are not active' });
    }

    await Account.findByIdAndUpdate(
      fromAccountId,
      { $inc: { balance: -amount } },
      { session }
    );

    await Account.findByIdAndUpdate(
      toAccountId,
      { $inc: { balance: amount } },
      { session }
    );

    const transaction = new Transaction({
      fromAccountId,
      toAccountId,
      amount,
      type: 'transfer',
      description,
      status: 'completed'
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Transfer completed successfully',
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const deposit = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, amount, description } = req.body;

    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Account is not active' });
    }

    await Account.findByIdAndUpdate(
      accountId,
      { $inc: { balance: amount } },
      { session }
    );

    const transaction = new Transaction({
      toAccountId: accountId,
      amount,
      type: 'deposit',
      description,
      status: 'completed'
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Deposit completed successfully',
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const withdraw = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, amount, description } = req.body;

    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user!._id 
    }).session(session);

    if (!account) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    if (account.status !== 'active') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Account is not active' });
    }

    await Account.findByIdAndUpdate(
      accountId,
      { $inc: { balance: -amount } },
      { session }
    );

    const transaction = new Transaction({
      fromAccountId: accountId,
      amount,
      type: 'withdrawal',
      description,
      status: 'completed'
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Withdrawal completed successfully',
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};