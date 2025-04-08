import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { timeHelper } from "./timeHelper";


export const sendNotifications = async (data:any):Promise<INotification> =>{

    const result:any = await Notification.create(data);

    //@ts-ignore
    const socketIo = global.io;

    if (socketIo) {
        socketIo.emit(`getNotification::${data?.receiver}`, {
            ...data,
            time: timeHelper.timeAgo(result?.createdAt!),
        });
    }

    return result;
}



  

  