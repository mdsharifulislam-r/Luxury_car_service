import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { StatusCodes } from "http-status-codes";

const createReview = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;
        const review = await ReviewService.giveReviewToDB(user, payload);
        sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Create Review Successfully",
        data: review,
        });
    }
)

export  const ReviewController = {
    createReview
}