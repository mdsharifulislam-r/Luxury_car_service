import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { Documents } from '../document/document.model';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const image = getSingleFilePath(req.files,'image')
    const result = await UserService.createUserToDB({...userData, image});

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);


  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const deleteUser = catchAsync(
  async (req:Request,res:Response)=>{
    const password = req.body.password
    const user = req.user
    const data = await UserService.deleteUserAccount(user,password)
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Account Deleted Successfully"
    })
  }
)


const getSubcription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getSubScriptionsOfUserFromDB(user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subcription data retrieved successfully',
    data: result,
  });
});

const setLocation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { latitude, longitude } = req.body;
  const data = await UserService.setInitalLocation(user, latitude, longitude);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location updated successfully',
    data: data,
  });
});

export const UserController = { createUser, getUserProfile, updateProfile,deleteUser,getSubcription,setLocation };
