import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import Stripe from 'stripe';

export type IUser = {
  name: string;
  role: USER_ROLES;
  email: string;
  password: string;
  location: string;
  image?: string;
  status: 'active' | 'delete';
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  liveLocation?:{
    latitude: number;
    longitude: number;
  };
  subscriptions?:{
    subscriptionId:string;
    start:Date;
    end: Date;
    priceId:string
  },
  customerId?:string,
  accountInfo?:{
    stripeAccountId:string,
    stripeAccountLink:string
    status:string;
    anotherId:string;
  }
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  CreateUserDocumentsInitial(id:Types.ObjectId):Promise<Boolean>;
  addSubscription(email: string,subscriptionId:string,start:number,end:number,priceId:string,customer_id:string):Promise<void>,
  CencelSubscription(customer:string):Promise<void>
  updateUserSubscription(customerId:string,start:number,end:number):Promise<void>,
  HandleConnectStripe(data:Stripe.Account):Promise<void>
} & Model<IUser>;
