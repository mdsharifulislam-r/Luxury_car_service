import express from 'express'
import auth from '../../middlewares/auth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import { ServiceValidation } from './service.validation'
import { ServiceController } from './service.controller'
import fileUploadHandler from '../../middlewares/fileUploadHandler'

const router = express.Router()

router.post('/',fileUploadHandler(),auth(USER_ROLES.PROVIDER),validateRequest(ServiceValidation.createServiceZodSchema),ServiceController.createService)

router.get('/',ServiceController.getServices)

router.get('/:id',ServiceController.getServiceById)

router.put('/:id',fileUploadHandler(),auth(USER_ROLES.PROVIDER),validateRequest(ServiceValidation.updateServiceZodSchema),ServiceController.updateService)

router.delete('/:id',auth(USER_ROLES.PROVIDER,USER_ROLES.ADMIN),ServiceController.deleteService)

export const ServiceRoutes = router