import express from 'express'
import { PlanController } from './plan.controller'
import auth from '../../middlewares/auth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import {PlanValidation  } from './plan.validation'
const router = express.Router()


router.post("/create",auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),validateRequest(PlanValidation.createSubscriptionZodSchema),PlanController.createPlan)
router.get("/",PlanController.getPlans)
router.put('/:id',auth(),validateRequest(PlanValidation.updateSubscriptionZodSchema),PlanController.updatePlan)
router.delete("/:id",auth(),PlanController.deletePlan)
router.post('/manage/:customer_id',auth(),PlanController.managePlan)
router.post('/expire',PlanController.expireAllUserSubscriptions)

export const PlanRoutes = router