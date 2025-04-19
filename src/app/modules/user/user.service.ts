import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Documents } from '../document/document.model';
import { Socket } from 'socket.io';
import { compare } from 'bcrypt';
import { Service } from '../service/service.model';
import { Subscription } from '../subscription/subscription.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  if(createUser.role==USER_ROLES.PROVIDER){
  await User.CreateUserDocumentsInitial(createUser._id)
  }

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const documents = await Documents.findOne({user_id:id})

  return {
    ...isExistUser,
    documents
  };
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};


const deleteUserAccount = async (user:JwtPayload,password:string)=>{
  const existUser = await User.findById(user.id).select("+password")
  if(!existUser){
    throw new ApiError(404,'Account Not found')
  }
  
  const comparePassword = await compare(password,existUser.password)

  
  if(!comparePassword){
    throw new ApiError(400,'Invalid credintials')

  }

    await User.findOneAndUpdate({_id:existUser._id},{
      status:"delete"
    })
 
  if(existUser.role == USER_ROLES.PROVIDER){
    await User.findOneAndUpdate({_id:existUser._id},{
      status:"delete"
    })
    
    await Service.updateMany({provider:existUser._id,status:{
      $ne:"delete"
    }},{status:"delete"})
  }
}

const getSubScriptionsOfUserFromDB = async (user:JwtPayload)=>{
  const subscription = await Subscription.findOne({user:user.id,status:"active"}).populate('plan')
  if(!subscription){
    throw new ApiError(404,'user not using any subscription')
  }
  return subscription
}

const setInitalLocation = async (user:JwtPayload,latitude:number,longitude:number)=>{

 const userData= await User.findOneAndUpdate({_id:user.id},{location:{latitude,longitude}},{new:true})

 return userData

}
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteUserAccount,
  getSubScriptionsOfUserFromDB,
  setInitalLocation
};
