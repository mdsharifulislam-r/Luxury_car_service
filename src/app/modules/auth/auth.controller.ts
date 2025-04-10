import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import ApiError from '../../../errors/ApiError';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyEmailToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      'Please check your email. We have sent you a one-time passcode (OTP).',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

const uploadDocuments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const files:any = req.files
  const type = req.body.type;
  const frontend = files?.image[0].filename
  const backend = files?.image[1].filename


  if(!frontend || !backend){
    throw new ApiError(StatusCodes.BAD_REQUEST,"Images must be provided")
  }
  await AuthService.uploadDocumentsToDB(user,type, frontend, backend);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Documents uploaded successfully',
  });
  
})

const refreshAccessToken = catchAsync(async (req: Request, res: Response) =>{
  const barerToken = req.headers.authorization;
  if(!barerToken){
    throw new ApiError(StatusCodes.BAD_REQUEST,"Token not provided")
  }
  const token = barerToken.split(" ")[1]
  if(!token){
    throw new ApiError(StatusCodes.NOT_FOUND,"Token not found")
  }
  const result = await AuthService.refreshAccessTokenDB(token!);
  sendResponse(res,{
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Access token refreshed successfully.',
    data: result,
  });
  })

export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  uploadDocuments,
  refreshAccessToken
};
