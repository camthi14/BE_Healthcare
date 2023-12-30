import { ReportService } from "@/services";
import { OKResponse } from "@/utils";
import { Request, Response } from "express";

class ReportController {
  dashboard = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await ReportService.dashboard();
    return new OKResponse({
      message: "Lấy danh sách thống kê thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };
}

export default new ReportController();
