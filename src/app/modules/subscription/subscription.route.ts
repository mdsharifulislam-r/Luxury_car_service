import express from 'express'
import { SubscriptionController } from './subscription.controller'
import auth from '../../middlewares/auth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import { PlanValidation } from '../plan/plan.validation'
import { PlanController } from '../plan/plan.controller'

const router = express.Router()
router.post('/',auth(USER_ROLES.CUSTOMER),validateRequest(PlanValidation.createSubscribePlanZodSchema),PlanController.subscribePlan)
router.post('/expire-all',SubscriptionController.expireSubscriptions)

export const SubscriptionRouts = router