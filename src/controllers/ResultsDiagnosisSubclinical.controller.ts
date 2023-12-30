import { CommonRequest } from "@/helpers";
import {
  GetByCardDetailIdQuery,
  ResultsDiagnosisSubclinicalInputCreate,
  ResultsDiagnosisSubclinicalInputUpdate,
} from "@/schema";
import { ResultsDiagnosisSubclinicalService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ResultsDiagnosisSubclinicalController {
  create = async (
    req: CommonRequest<{}, {}, ResultsDiagnosisSubclinicalInputCreate>,
    res: Response
  ) => {
    const images = req.imageId as string[] | undefined;

    const response = await ResultsDiagnosisSubclinicalService.create({
      ...req.body,
      subclinical_id: Number(req.body.subclinical_id),
      images,
      removeImages: JSON.parse(req.body.removeImages || "[]"),
    });

    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ResultsDiagnosisSubclinicalService.getAll(filters, options);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response.results,
      options: {
        limit: options.limit,
        page: options.page,
        totalRows: response.total,
        totalPage: Math.ceil(response.total / options.limit),
      },
    }).send(res);
  };

  getById = async (
    req: Request<ResultsDiagnosisSubclinicalInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ResultsDiagnosisSubclinicalService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getByCardDetailId = async (
    req: Request<ResultsDiagnosisSubclinicalInputUpdate["params"], {}, {}, GetByCardDetailIdQuery>,
    res: Response
  ) => {
    const response = await ResultsDiagnosisSubclinicalService.getByCardDetailId(req.query);
    return new OKResponse({
      message: `Lấy dữ liệu thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<
      ResultsDiagnosisSubclinicalInputUpdate["params"],
      {},
      ResultsDiagnosisSubclinicalInputUpdate["body"]
    >,
    res: Response
  ) => {
    const images = req.imageId as string[] | undefined;
    const id = req.params.id;

    const response = await ResultsDiagnosisSubclinicalService.update(
      {
        ...req.body,
        subclinical_id: Number(req.body),
        images,
      },
      id
    );
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (
    req: Request<ResultsDiagnosisSubclinicalInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ResultsDiagnosisSubclinicalService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ResultsDiagnosisSubclinicalController();
