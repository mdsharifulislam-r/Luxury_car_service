import express from 'express'
import { SubscriptionController } from './subscription.controller'
import auth from '../../middlewares/auth'
import { USER_ROLES } from '../../../enums/user'
import bodyParser from "body-parser"
import validateRequest from '../../middlewares/validateRequest'
import { SubscriptionValidation } from './subscription.validation'
const router = express.Router()

router.post('/',auth(USER_ROLES.CUSTOMER),validateRequest(SubscriptionValidation.createSubscribePlanZodSchema), SubscriptionController.subscribePlan)
router.post("/webhook",express.raw({ type: 'application/json' }),SubscriptionController.subscribeWebHook)
router.post("/create",auth(),validateRequest(SubscriptionValidation.createSubscriptionZodSchema),SubscriptionController.createSubscription)
router.get("/",SubscriptionController.getSubscriptions)
router.put('/:id',auth(),validateRequest(SubscriptionValidation.updateSubscriptionZodSchema),SubscriptionController.updateSubscription)
router.delete("/:id",auth(),SubscriptionController.deleteSubscription)
router.post('/manage/:customer_id',auth(),SubscriptionController.manageSubscriptions)

export const SubscriptionRoutes = router