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

const getAndSetLiveLocationAndSaveToDB = async (socket:Socket)=>{
  socket.on('set-location',async (user_id:string,longLat:number,lat:number)=>{
    
    const existUser = await User.findById(user_id)

    
    if(!existUser){
      throw new Error('User not found')
    }
    if(existUser.liveLocation?.latitude==lat && existUser.liveLocation?.longitude==longLat){
      return;
    }
  const sam = await User.findOneAndUpdate({_id:user_id},{liveLocation:{latitude:lat,longitude:longLat}}, {new:true})
   
  })
  socket.on('get-location',async (userId:string)=>{
    const  user  = socket.handshake.auth!
    
    const id = userId?userId:user.id
    
    const exuser = await User.findOne({_id:id}).select('liveLocation')
    
    socket.emit('location',exuser?.liveLocation)
  })
}
const deleteUserAccount = async (user:JwtPayload,password:string)=>{
  const existUser = await User.findById(user.id).select("+password")
  if(!existUser){
    throw new ApiError(404,'Account Not found')
  }
  
  const comparePassword = await compare(password,existUser.password)

  
  if(!comparePassword){
    throw new ApiError(400,'Invalid credintials')

  }
  if(existUser.role == USER_ROLES.CUSTOMER){
    await User.findOneAndUpdate({_id:existUser._id},{
      status:"delete"
    })
    return
  }
  if(existUser.role == USER_ROLES.PROVIDER){
    await User.findOneAndUpdate({_id:existUser._id},{
      status:"delete"
    })
    await Service.deleteMany({provider:existUser._id})
  }
}
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAndSetLiveLocationAndSaveToDB,
  deleteUserAccount
};
