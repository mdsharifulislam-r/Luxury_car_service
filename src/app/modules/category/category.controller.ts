import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { CategoryService } from "./category.service";
import sendResponse from "../../../shared/sendResponse";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const image = getSingleFilePath(req.files,'image')
    const result = await CategoryService.saveCategoryToDB({...payload, image});
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Category created successfully',
      data: result,
    });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoryFromDB();
  sendResponse(res, {    
    success: true,
    statusCode: 200,
    message: 'Category Retrieve Successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const image = getSingleFilePath(req.files,'image')
  const result = await CategoryService.updateCategoryToDB(id, {...payload, image});
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category updated successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategory,
  updateCategory
};