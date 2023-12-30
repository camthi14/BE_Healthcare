import { CommonRequest } from "@/helpers";
import { Request } from "express";
import { Pagination } from "types";

type ResponseTypeHandleFilterQuery = {
  filters: Record<string, any>;
  options: Pagination;
};

/**
 * @description filter value
 * @param req
 * @returns
 */
export const handleFilterQuery = (
  req: Request | CommonRequest<any, any, any, any>,
  limitNumber = 5
): ResponseTypeHandleFilterQuery => {
  let { limit, order, page, ...filters } = req.query;
  let newLimit: number = limitNumber;
  let newPage: number = 1;

  if (limit) {
    newLimit = +limit <= 0 ? 5 : +limit;
  }

  if (page) {
    newPage = +page <= 0 ? 1 : +page;
  }

  return {
    filters: { ...filters },
    options: { limit: newLimit, page: newPage, order: order as string },
  };
};
