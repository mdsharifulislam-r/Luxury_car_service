
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { DisclaimberValidation } from './disclaimber.validation';
import { DisclaimberController } from './disclaimber.controller';

const router = express.Router();

router.post("/",auth(),validateRequest(DisclaimberValidation.createDisclaimberZodSchema),DisclaimberController.createDisclaimber)

router.get("/",DisclaimberController.getdislcaimber)

export const DislaimberRoutes = router