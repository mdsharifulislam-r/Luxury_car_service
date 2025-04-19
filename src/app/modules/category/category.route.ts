import express from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router.post("/",fileUploadHandler(),auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),validateRequest(CategoryValidation.createCategoryZodSchema),CategoryController.createCategory)
router.get("/",CategoryController.getAllCategory)
router.patch("/:id",auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),validateRequest(CategoryValidation.createUpdateCategoryZodSchema),CategoryController.updateCategory)

export const CategoryRoutes = router