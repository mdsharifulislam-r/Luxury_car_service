import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { messageValidation } from './massage.validation';
const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  validateRequest(messageValidation.createSendMassageZodSchema),
  MessageController.sendMessage
);
router.get(
  '/:id',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  MessageController.getMessage
);

router.patch(
  '/:id',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  MessageController.seenMessage
);

export const MessageRoutes = router;