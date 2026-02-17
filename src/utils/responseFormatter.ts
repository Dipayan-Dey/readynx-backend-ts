

import { Response } from "express";
import { formatErrorResponse } from "./errors";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
  statusCode?: number;
}


export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  timestamp: string;
  statusCode: number;
  service?: string;
  stack?: string;
}


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta;
}


export const formatSuccessResponse = <T = any>(
  data?: T,
  message?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(), 
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};


export const formatPaginatedResponse = <T = any>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T[]> => {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T[]> = {
    success: true,
    timestamp: new Date().toISOString(),
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  if (message) {
    response.message = message;
  }

  return response;
};


export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number = 200,
  data?: T,
  message?: string
): Response => {
  const response = formatSuccessResponse(data, message);
  return res.status(statusCode).json(response);
};


export const sendPaginatedSuccess = <T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const response = formatPaginatedResponse(data, page, limit, total, message);
  return res.status(200).json(response);
};


export const sendError = (
  res: Response,
  error: any,
  statusCode?: number
): Response => {
  const errorResponse = formatErrorResponse(error);
  const code = statusCode || errorResponse.statusCode || 500;

  return res.status(code).json(errorResponse);
};


export const sendCreated = <T = any>(
  res: Response,
  data?: T,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess(res, 201, data, message);
};


export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};


export const sendNotFound = (
  res: Response,
  message: string = "Resource not found"
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 404,
  };

  return res.status(404).json(response);
};


export const sendBadRequest = (
  res: Response,
  message: string = "Bad request",
  errors?: any[]
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 400,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(400).json(response);
};


export const sendUnauthorized = (
  res: Response,
  message: string = "Authentication required"
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 401,
  };

  return res.status(401).json(response);
};


export const sendForbidden = (
  res: Response,
  message: string = "Access denied"
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 403,
  };

  return res.status(403).json(response);
};


export const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  const camelCased: any = {};

  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCased[camelKey] = toCamelCase(obj[key]);
  });

  return camelCased;
};
