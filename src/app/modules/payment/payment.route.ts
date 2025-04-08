import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';


const router = express.Router();
router.post('/create-account',auth(USER_ROLES.PROVIDER), PaymentController.createAccount);

export const PaymentRoutes = router;