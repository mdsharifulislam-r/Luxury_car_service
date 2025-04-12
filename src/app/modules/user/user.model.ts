import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, ObjectId, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { Documents } from '../document/document.model';
import Stripe from 'stripe';
import { stripe } from '../plan/plan.service';

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
      type:Schema.Types.ObjectId,
      ref:"Subscription",
      default:null
    },
    customerId: {
      type: String,
      required:false

    },
    liveLocation: {
      type: {
        latitude: Number,
        longitude: Number
      },
      default: null
    },
    accountInfo: {
      type:{
        stripeAccountId: String,
        stripeAccountLink: String,
        status: String,
        anotherId: String
      },
      default: null
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






userSchema.statics.HandleConnectStripe = async (data:Stripe.Account) =>{
   // Find the user by Stripe account ID

   
   const existingUser = await User.findOne({
    email:data.email,
});


if (!existingUser) {
    // throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    console.log('user not found')
    return
}


// Check if the onboarding is complete

    const loginLink = await stripe.accounts.createLoginLink(data.id);
    // Save Stripe account information to the user record
    await User.findOneAndUpdate(
      { _id: existingUser?._id },
      {
        $set: {
          'accountInfo.anotherId': loginLink.url,
        }
      },
      { new: true }
    );
    

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
