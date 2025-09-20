import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  transfer, 
  deposit, 
  withdraw,
  transferValidation,
  depositValidation,
  withdrawValidation
} from '../controllers/transactionController';

const router = express.Router();

router.use(authenticateToken);

router.post('/transfer', transferValidation, transfer);
router.post('/deposit', depositValidation, deposit);
router.post('/withdraw', withdrawValidation, withdraw);

export default router;