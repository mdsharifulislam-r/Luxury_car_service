import mongoose from 'mongoose';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Chat } from '../chat/chat.model';

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

  const sender = await User.findById(payload.sender).select("firstName")

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

const getMessageFromDB = async (id: any): Promise<IMessage[]> => {
  const messages = await Message.find({ chatId: id })
    .sort({ createdAt: -1 })
  return messages;
};

export const MessageService = { sendMessageToDB, getMessageFromDB };