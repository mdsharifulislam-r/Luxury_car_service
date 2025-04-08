import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import mongoose from 'mongoose';
import { Order } from '../order/order.model';
import { timeHelper } from '../../../helpers/timeHelper';

// get notifications
const getNotificationFromDB = async (user: JwtPayload) => {
  const result = await Notification.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(user.id),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  // Add timeAgo in JS
  const dataWithTime = result.map((item) => ({
    ...item,
    time: timeHelper.timeAgo(item.createdAt),
  }));

  const unreadCount = await Notification.countDocuments({
    receiver: user.id,
    read: false,
  });

  return {
    result: dataWithTime,
    unreadCount,
  };
};


// read notifications only for user
const readNotificationToDB = async (
  user: JwtPayload
): Promise<INotification | undefined> => {
  const result: any = await Notification.updateMany(
    { receiver: user.id, read: false },
    { $set: { read: true } }
  );
  return result;
};

// get notifications for admin
const adminNotificationFromDB = async () => {
  const result = await Notification.find({ type: 'ADMIN' });
  return result;
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
  const result: any = await Notification.updateMany(
    { type: 'ADMIN', read: false },
    { $set: { read: true } },
    { new: true }
  );
  return result;
};

const serviceReminderIntoDB = async ()=>{
  const now = new Date()
  const result = await Order.find({})
}
export const NotificationService = {
  adminNotificationFromDB,
  getNotificationFromDB,
  readNotificationToDB,
  adminReadNotificationToDB,
};