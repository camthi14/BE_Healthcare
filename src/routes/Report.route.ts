import { ReportController } from "@/controllers";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.get("/dashboard", asyncHandler(ReportController.dashboard));

export default route;
