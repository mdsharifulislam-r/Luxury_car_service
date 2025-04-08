import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createAccount = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user
        const result = await PaymentService.createStripeAccoutToDB(user,payload?.stripe_id);
        sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Create Account Successfully",
        data: result,
        });
    }
)

export const PaymentController = {
    createAccount
}