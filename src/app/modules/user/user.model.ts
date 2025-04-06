import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, ObjectId, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { Documents } from '../document/document.model';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
    subscriptions: {
      type:{
        subscriptionId: String,
        start: Date,
        end: Date,
        priceId:String
      }
    },
    customerId: {
      type: String,
      required:false

    },
  },

  
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id).lean();
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

userSchema.statics.CreateUserDocumentsInitial = async (id: ObjectId) => {
  const isExist = await Documents.findOne({user_id:id})
  if (!isExist) {
    await Documents.create({user_id: id});
  }
  return true;
}

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.statics.addSubscription = async (email:string,subscription_id:string,start:number,end:number,priceId:string,customer:string)=>{
  
  const sub= {
    subscriptionId: subscription_id,
    start: new Date(start*1000),
    end: new Date(end*1000),
    priceId: priceId
  }
  await User.findOneAndUpdate({email:email},{
    subscriptions: sub,
    customerId: customer
  })
}

userSchema.statics.updateUserSubscription= async (cutomerId:string, start:number, end:number)=>{
  console.log(cutomerId);
  const user = await User.findOne({customerId:cutomerId})
  if(!user){
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if(user.subscriptions){
    User.findOneAndUpdate({customerId:cutomerId},{
      subscriptions: {
        subscriptionId: user.subscriptions.subscriptionId,
        start: new Date(start*1000),
        end: new Date(end*1000),
        priceId: user.subscriptions.priceId
      }
    })
  }else{
    throw new ApiError(StatusCodes.FORBIDDEN, 'User does not have active subscription');
  }
 
}

userSchema.statics.CencelSubscription= async (email:string)=>{
  const user = await User.findOne({email});
  if(!user){
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if(user.subscriptions && user.subscriptions.end > new Date()){
    User.findOneAndUpdate({email:email},{
      subscriptions: null,
      customerId: null
    })
  }else{
    throw new ApiError(StatusCodes.FORBIDDEN, 'User does not have active subscription');
  }
}

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
