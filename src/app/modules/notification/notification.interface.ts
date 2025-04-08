import { Model, Types } from 'mongoose';

export type INotification = {
  text: string;
  sender?: Types.ObjectId;
  receiver?: Types.ObjectId;
  title?: string;
  read: boolean;
  direction?: string;
  link?: string;
};

export type NotificationModel = Model<INotification>;