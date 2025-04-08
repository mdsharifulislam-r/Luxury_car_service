import express from 'express';
import auth from '../../middlewares/auth';
import { ChatController } from './chat.controller';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.post(
  '/:id',
  auth(USER_ROLES.PROVIDER, USER_ROLES.CUSTOMER),
  ChatController.createChat
);
router.get(
  '/',
  auth(USER_ROLES.PROVIDER, USER_ROLES.CUSTOMER),
  ChatController.getChat
);

export const ChatRoutes = router;