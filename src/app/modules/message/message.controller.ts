import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MessageService } from './message.service';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;


  let image;
  if (req.files && "image" in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const payload = {
    ...req.body,
    image:image,
    sender: user,
  };

  const message = await MessageService.sendMessageToDB(payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Send Message Successfully',
    data: message,
  });
});

const getMessage = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = req.query;
  const messages = await MessageService.getMessageFromDB(id,query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message Retrieve Successfully',
    data: messages.messages,
    pagination: messages.paginationInfo,
  });
});

const seenMessage = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = req.user;
  const messages = await MessageService.seenMessageFromDB(id,user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message seen Successfully',
    data: messages,
  });
});

export const MessageController = { sendMessage, getMessage, seenMessage };