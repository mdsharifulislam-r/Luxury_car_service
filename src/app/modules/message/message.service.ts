import mongoose from 'mongoose';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Chat } from '../chat/chat.model';
import QueryBuilder from '../../builder/QueryBuilder';

const sendMessageToDB = async (payload: Partial<IMessage>): Promise<IMessage> => {

  const chat = await Chat.findById(payload.chatId).populate({
    path: 'participants',
    select: '_id name image',
    match: {
      _id: { $ne: payload.sender }, // Exclude sender from participants
    },
  })
  
  if (!chat) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Chat not found");
  }

  const receiver = chat?.participants[0]?._id;

  const sender = await User.findById(payload.sender).select("name")

  // save to DB
  const response = await Message.create(payload);

  //@ts-ignore
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chatId}`, response);
    const data = {
      text: `${sender?.name} send you message.`,
      title: "Received Message",
      link: payload?.chatId,
      direction: "message",
      receiver: receiver,
      read:false
    }
    await sendNotifications(data)

  }

  return response;
};

const getMessageFromDB = async (id: any,query:Record<string,any>) => {
  const result = new QueryBuilder(Message.find({ chatId: id }),query).paginate().sort()
    
  const paginationInfo = await result.getPaginationInfo()
  const messages = await result.modelQuery.populate(['sender'],['name','image']).lean()
  
  return {
    messages:messages.reverse(),
    paginationInfo
  }
};

const seenMessageFromDB = async (id: any)  => {

  const data = await Message.updateMany({ chatId: id,seen:{
    $ne: true
  } },{seen:true})
  
  

  return true
}

export const MessageService = { sendMessageToDB, getMessageFromDB, seenMessageFromDB };