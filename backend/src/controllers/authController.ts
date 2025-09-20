import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Account from '../models/Account';
import { generateToken } from '../middleware/auth';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phoneNumber').isMobilePhone('any'),
  body('dateOfBirth').isISO8601(),
  body('address.street').trim().isLength({ min: 1 }),
  body('address.city').trim().isLength({ min: 1 }),
  body('address.state').trim().isLength({ min: 1 }),
  body('address.zipCode').trim().isLength({ min: 1 })
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phoneNumber, dateOfBirth, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address
    });

    await user.save();

    const checkingAccount = new Account({
      userId: user._id,
      accountType: 'checking',
      balance: 1000
    });

    const savingsAccount = new Account({
      userId: user._id,
      accountType: 'savings',
      balance: 0,
      interestRate: 0.02
    });

    await Promise.all([checkingAccount.save(), savingsAccount.save()]);

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};