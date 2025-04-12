import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { orderValidation } from './order.validation';

const router = express.Router();

router.post('/book', auth(USER_ROLES.CUSTOMER),validateRequest(orderValidation.createBookOrderZodSchema), OrderController.createOrder);
router.get('/:id', auth(), OrderController.getOrder);
router.get('/', auth(), OrderController.getOrdersByUser);
router.patch('/:id', auth(USER_ROLES.PROVIDER), validateRequest(orderValidation.changeOrderStatusZodSchema), OrderController.changeOrderStatus);
router.post("/reminder",OrderController.giveReminderToUsers)
router.post("/complete/:id",auth(USER_ROLES.CUSTOMER),OrderController.completeOrder)
router.delete("/cancel/:id",auth(USER_ROLES.CUSTOMER),OrderController.cancelOrder)
export const OrderRoutes = router;
