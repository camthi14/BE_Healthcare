import { CommonRequest } from "@/helpers";
import { Subclinical } from "@/models";
import { ServiceInputCreate, ServiceInputUpdate } from "@/schema";
import { ServiceService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ServiceController {
  create = async (req: CommonRequest<{}, {}, ServiceInputCreate>, res: Response) => {
    const photo = req.imageId as string;

    const response = await ServiceService.create({
      content: req.body.content,
      desc: req.body.desc,
      name: req.body.name,
      price: +req.body.price,
      service_type_id: +req.body.service_type_id,
      photo,
      subclinical: JSON.parse(req.body.subclinical) as Subclinical[],
    });

    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ServiceService.getAll(filters, options);
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

  getById = async (req: Request<ServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ServiceService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<ServiceInputUpdate["params"], {}, ServiceInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo = req.imageId as string;

    const response = await ServiceService.update(
      {
        content: req.body.content!,
        desc: req.body.desc!,
        name: req.body.name!,
        price: +req.body.price!,
        service_type_id: +req.body.service_type_id!,
        photo,
        subclinical: JSON.parse(req.body.subclinical) as Subclinical[],
      },
      +id
    );

    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<ServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ServiceService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ServiceController();
