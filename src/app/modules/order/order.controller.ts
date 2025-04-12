import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";
import { StatusCodes } from "http-status-codes";

const createOrder = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;
        const result = await OrderService.createOrderToDB(user, payload);
        sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Create Order Successfully",
        data: result,
        });
    }
)

const getOrder = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const order = await OrderService.getOrderById(id as any);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Order Retrieve Successfully",
            data: order,
        });

    })
const getOrdersByUser = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const query = req.query;
        const orders = await OrderService.getOrdersByUserId(user as any,query);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Order Retrieve Successfully",
            data: orders.orders,
            pagination: orders.pagination,
        });
    })

const changeOrderStatus = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const status = req.body.status;
        const user = req.user;
        const order = await OrderService.acceptOrRejectOrderInDB(user as any, id as any, status);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Order Retrieve Successfully",
            data: order,
        });
    })
const giveReminderToUsers = catchAsync(
    async (req: Request, res: Response) => {
        const orders = await OrderService.giveReminderToUsers()
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Reminder sent Successfully",
            data: orders,
        });
    })
const completeOrder = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const user = req.user;
        const order = await OrderService.completeOrder( id as any,user);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Order Completed Successfully",
            data: order,
        });
    })
const cancelOrder = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const user = req.user;
        const order = await OrderService.cencelOrder( id as any,user);
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Order Canceled Successfully",
            data: order,
        });
    }
)
export const OrderController = {
    createOrder,
    getOrder,
    getOrdersByUser,
    changeOrderStatus,
    giveReminderToUsers,
    completeOrder,
    cancelOrder
    
}