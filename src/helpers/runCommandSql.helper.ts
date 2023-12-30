import {
  FILE_EXTENSION_CONTROLLER,
  FILE_EXTENSION_MODEL,
  FILE_EXTENSION_ROUTE,
  FILE_EXTENSION_SCHEMA,
  FILE_EXTENSION_SERVICE,
} from "@/constants";
import { customLog } from "@/utils/common.util";
import fs from "fs";
import path from "path";
import { DataTypesMySQL, ResponseHandleSetup, isDataTypesMySQL, isDataTypesMySQLEnum } from "types";

export const processSQLFile = (fileName: string): Array<string> => {
  // Extract SQL queries from files. Assumes no ';' in the fileNames
  var queries = fs
    .readFileSync(fileName)
    .toString()
    .replace(/--.*/g, " ")
    .replace(/\/\*([^*]|\*(?!\/))*\*\//g, " ")
    .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
    .replace(/\s+/g, " ") // excess white space
    .split(";") // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(function (el) {
      return el.length != 0;
    }); // remove any empty ones

  return queries;
};

export const startsWith = (value: string, startW: string) => {
  return value.toLowerCase().startsWith(startW);
};

/**
 * @description Xử lý chuỗi để trả về dữ liệu gồm các trường, giá trị, kiểu dữ liệu
 * @param line Giá trị từng dòng được cắt đã xử lý
 * @returns
 */
const handleSetup = (line: string): ResponseHandleSetup => {
  /** Cắt khoảng trống */
  const arraySpace = line.split(" ");

  /** Trường này có bắt buộc không <=> NOT NULL */
  let required = false;

  /** Trường này là những trường duy nhất trong 1 table */
  let unique = false;

  if (arraySpace.includes("NOT") && arraySpace.includes("NULL")) {
    required = true;
  }

  if (arraySpace.includes("UNIQUE") || arraySpace.includes("unique")) {
    unique = true;
  }

  /** Tiếp tục lấy phần tử [0] để thay thế kí ` sẽ tạo ra được tên trường */
  const filed = arraySpace[0].replace(/`/g, "");

  /** Cắt chuỗi line từ vị trí `${arraySpace[0]} ` đến vị trí cuối cùng của line*/
  let type = line.slice(`${arraySpace[0]} `.length, line.length);
  let values = "";

  const temp = type.split(" ")[0];

  /** Nếu kiểu dữ liệu bắt đầu với enum */
  if (startsWith(type, "enum")) {
    /** Cắt kí tự ' ra thành mảng sẽ có được những giá trị trong enum */
    const arrayValues = type.split("'");

    /** Duyệt qua mảng để trả về giá trị mới sẽ là giá trị của trường tương ứng với enum trong interface */
    values = arrayValues
      .reduce((newValue, item, index) => {
        if (
          item.startsWith(")") ||
          item.endsWith(")") ||
          item.startsWith(",") ||
          item.startsWith("ENUM")
        )
          return newValue;

        /** Giá trị trả về sẽ là "value1" | "value2" */
        return (newValue += `"${item}" | `);
      }, "")
      .slice(0, -3); /** Cắt bỏ vị trí ` | ` là 3 kí tự */

    /** Chuyển đổi dữ liệu */
    type = DataTypesMySQL["ENUM"];
  }

  /** Nếu kiểu dữ liệu bắt đầu với varchar */
  if (startsWith(type, "varchar")) {
    type = DataTypesMySQL["VARCHAR"];
  }

  if (isDataTypesMySQL(temp)) {
    type = DataTypesMySQL[temp];
  }

  return { filed, type, values, required, unique } as ResponseHandleSetup;
};

/** @description Tạo nội dung cho file `model` theo tên Table */
const handleCreateModel = async (
  response: Array<ResponseHandleSetup>,
  tableName: string,
  fileModel: string,
  fileModelIndex: string
) => {
  /** Tạo ra attribute fillables và loại bỏ những phần tử rỗng cho class Model theo tên Table */
  const fillables = response
    .map((fill) => {
      if (fill.filed === "created_at" || fill.filed === "updated_at") return "";
      return `"${fill.filed}"`;
    })
    .filter((v) => v);

  /**
   * Bắt đầu tạo nội dung cho file model theo tên Table
   * B1 Import Model
   */
  let content = `import { Model } from "@/lib";\n\n`;

  /** B2 Tạo Interface */
  content += `export interface ${tableName} {\n`;

  /**
   * B3 Tạo các attribute cho Interface
   *  + Duyệt qua mảng và trả về giá trị có tên trường và kiểu dữ liệu
   *  + VD:
   *  id?: number; (Giá trị này tương ứng với trường not required)
   *  type: "error" | "request" (Giá trị này tương ứng với trường enum)
   *  name: string (Giá trị này tương ứng với trường required)
   */
  content += response.reduce((result, val) => {
    if (
      val.filed === "id" ||
      val.filed === "created_at" ||
      val.filed === "deleted_at" ||
      val.filed === "updated_at"
    ) {
      return (result += `  ${val.filed}?: ${val.type};\n`);
    }

    if (val.type === "enum") {
      return (result += `  ${val.filed}${!val.required ? "?" : ""}: ${val.values};\n`);
    }

    return (result += `  ${val.filed}${!val.required ? "?" : ""}: ${val.type};\n`);
  }, "");

  /** Nhưng bước còn lại */
  content += `}\n\n`;
  content += `class ${tableName}Model extends Model {\n`;
  content += `\tprotected table: string = "${tableName}s";\n\n`;
  content += `\tprotected fillables: string[] = [${fillables}];\n\n`;
  content += `\tprotected timestamps: boolean = false;\n\n`;

  /** Get Fillables */
  content += `\tget getFillables() {\n`;
  content += `\t\treturn this.fillables;\n`;
  content += `\t}\n\n`;

  /** Get Table */
  content += `\tget getTable() {\n`;
  content += `\t\treturn this.table;\n`;
  content += `\t}\n\n`;

  /** Get  Timestamps */
  content += `\tget getTimestamps() {\n`;
  content += `\t\treturn this.timestamps;\n`;
  content += `\t}\n`;

  content += `}\n\n`;
  content += `export default new ${tableName}Model();\n`;

  /** Export các model vừa tạo vào file models/index.ts */
  let contentIndex = `export * from "./${tableName}.model";\n`;
  contentIndex += `export {default as ${tableName}Model} from "./${tableName}.model";\n`;

  /** Thực hiện ghi nội dung vào file */
  await fs.promises.writeFile(fileModel, content, { encoding: "utf-8" });

  /** Thực hiện nối tiếp nội dung vào file */
  await fs.promises.appendFile(fileModelIndex, contentIndex, { encoding: "utf-8" });

  customLog("Success", `CREATE MODEL SUCCESS => ${tableName}`);
};

/** @description Tạo nội dung cho file `schema` theo tên Table */
const handleCreateSchema = async (
  response: Array<ResponseHandleSetup>,
  tableName: string,
  fileSchema: string,
  fileSchemaIndex: string
) => {
  let content = `import { object, string, TypeOf } from "zod";\n\n`;

  /** Tạo chema create theo tên Table */
  content += `export const ${tableName}CreateSchema = object({\n`;
  content += `\tbody: object({\n`;
  content += response.reduce((result, value) => {
    if (!value.required || value.filed === "id") return result;

    let text = `\t\t${value.filed}: string({\n`;
    text += `\t\t\trequired_error: "${value.filed} là trường bắt buộc",\n`;
    text += `\t\t}),\n`;

    return (result += text);
  }, "");
  content += `\t}),\n`;
  content += `});\n\n`;

  /** Tạo chema update theo tên Table */
  content += `export const ${tableName}UpdateSchema = object({\n`;
  content += `\tparams: object({\n`;
  content += `\t\tid: string({\n`;
  content += `\t\t\trequired_error: "Id là tham số bắt buộc",\n`;
  content += `\t\t}),\n`;
  content += `\t}),\n`;
  content += `\tbody: object({\n`;
  content += response.reduce((result, value) => {
    if (!value.required || value.filed === "id") return result;

    let text = `\t\t${value.filed}: string({\n`;
    text += `\t\t\trequired_error: "${value.filed} là trường bắt buộc",\n`;
    text += `\t\t}),\n`;

    return (result += text);
  }, "");
  content += `\t}),\n`;
  content += `});\n\n`;

  /** Export Type Create và Update Input */
  content += `export type ${tableName}InputCreate = TypeOf<typeof ${tableName}CreateSchema>["body"];\n\n`;
  content += `export type ${tableName}InputUpdate = TypeOf<typeof ${tableName}UpdateSchema>;\n`;

  const contentIndex = `export * from "./${tableName}.schema";\n`;

  /** Thực hiện ghi nội dung vào file */
  await fs.promises.writeFile(fileSchema, content, { encoding: "utf-8" });

  /** Thực hiện nối tiếp nội dung vào file */
  await fs.promises.appendFile(fileSchemaIndex, contentIndex, { encoding: "utf-8" });

  customLog("Yellow", `CREATE SCHEMA ${tableName} SUCCESS...`);
};

/** @description Tạo nội dung cho file `service` theo tên Table */
const handleCreateService = async (
  response: Array<ResponseHandleSetup>,
  tableName: string,
  fileService: string,
  fileServiceIndex: string
) => {
  let content = "";

  const model = tableName;

  /** Import những gì cần */
  content += `import { ${tableName}, ${model}Model } from "@/models";\n`;
  content += `import { ${tableName}InputCreate, ${tableName}InputUpdate } from "@/schema";\n`;
  content += `import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";\n`;
  content += `import { ObjectType, Pagination } from "types";\n\n`;

  /** Tạo class theo tên table */
  content += `class ${tableName}Service {\n`;

  /** Tạo hàm static create */
  content += `\tstatic create = async (data: ${tableName}InputCreate) => {\n`;

  content += response.reduce((text, value) => {
    if (!value.unique) return text;
    text += `\t\tif (await ${model}Model.findOne<${tableName}>({ ${value.filed}: data.${value.filed} })) {\n`;
    text += `\t\t\tthrow new ConflictRequestError("${value.filed} đã tồn tại...");\n`;
    text += `\t\t}\n\n`;
    return text;
  }, "");

  content += `\t\treturn await ${model}Model.create(data);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm static update */
  content += `\tstatic update = async (data: ${tableName}InputUpdate["body"], id: number) => {\n`;
  content += `\t\tlet ${model}: ${tableName} | boolean;\n\n`;

  content += response.reduce((text, value) => {
    if (!value.unique) return text;
    text += `\t\t${model} = await ${model}Model.findOne<${tableName}>({ ${value.filed}: data.${value.filed} });\n\n`;
    text += `\t\tif (${model} && ${model}.id !== id) {\n`;
    text += `\t\t\tthrow new ConflictRequestError("${value.filed} đã tồn tại...");\n`;
    text += `\t\t}\n\n`;
    return text;
  }, "");

  content += `\t\tif (!(await ${model}Model.update(data, id))) {\n`;
  content += `\t\t\tthrow new BadRequestError(\`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = \${id}\`);\n`;
  content += `\t\t}\n\n`;
  content += `\t\treturn true;\n`;
  content += `\t};\n\n`;

  /** Tạo hàm static getById */
  content += `\tstatic getById = async (id: number) => {\n`;
  content += `\t\tconst data = await ${model}Model.findOne<${tableName}>({ id: id });\n\n`;
  content += `\t\tif (!data) {\n`;
  content += `\t\t\tthrow new NotFoundRequestError(\`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = \${id}\`);\n`;
  content += `\t\t}\n\n`;
  content += `\t\treturn data;\n`;
  content += `\t};\n\n`;

  /** Tạo hàm static getAll */
  content += `\tstatic getAll = async (filters: Record<string, any>, options: Pagination) => {\n`;
  content += `\t\tconst results = await ${model}Model.findAll<${tableName}>(filters, undefined, options);\n`;
  content += `\t\tconst total = await ${model}Model.count(filters);\n`;
  content += `\t\tif (!results.length) return { results: [], total: 0 };\n`;
  content += `\t\treturn { results, total };\n`;
  content += `\t};\n\n`;

  /** Tạo hàm static findOne */
  content += `\tstatic findOne = async (conditions: ObjectType<${tableName}>) => {\n`;
  content += `\t\treturn await ${model}Model.findOne<${tableName}>(conditions);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm static deleteById */
  content += `\tstatic deleteById = async (id: number) => {\n`;
  content += `\t\tif (!(await ${model}Model.deleteById(id))) {\n`;
  content += `\t\t\tthrow new NotFoundRequestError(\`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = \${id}\`);\n`;
  content += `\t\t}\n\n`;
  content += `\t\treturn true;\n`;
  content += `\t};\n`;
  content += `}\n\n`;

  /** Export server */
  content += `export default ${tableName}Service;\n`;

  // customLog(content);

  const contentIndex = `export { default as ${tableName}Service } from "./${tableName}.service";\n`;

  /** Thực hiện ghi nội dung vào file */
  await fs.promises.writeFile(fileService, content, { encoding: "utf-8" });

  /** Thực hiện nối tiếp nội dung vào file */
  await fs.promises.appendFile(fileServiceIndex, contentIndex, { encoding: "utf-8" });

  customLog("Blue", `CREATE SERVICE ${tableName} SUCCESS...`);
};

/** @description Tạo nội dung cho file `controller` theo tên Table */
const handleCreateController = async (
  tableName: string,
  fileController: string,
  fileControllerIndex: string
) => {
  const service = `${tableName}Service`;
  const controller = `${tableName}Controller`;
  const inputCreate = `${tableName}InputCreate`;
  const inputUpdate = `${tableName}InputUpdate`;
  const tableLowercase = tableName;
  let content = "";

  /** Import nhưng file cần thiết */
  content += `import { ${inputCreate}, ${inputUpdate} } from "@/schema";\n`;
  content += `import { ${service} } from "@/services";\n`;
  content += `import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";\n`;
  content += `import { Request, Response } from "express";\n\n`;

  /** Tạo class controller theo tên table */
  content += `class ${controller} {\n`;

  /** Tạo hàm request create */
  content += `\tcreate = async (req: Request<{}, {}, ${inputCreate}>, res: Response) => {\n`;
  content += `\t\tconst response = await ${service}.create(req.body);\n`;
  content += `\t\treturn new CreatedResponse({\n`;
  content += `\t\t\tmessage: "Tạo dữ liệu thành công.",\n`;
  content += `\t\t\tmetadata: { lastInsertId: response },\n`;
  content += `\t\t}).send(res);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm request getAll */
  content += `\tgetAll = async (req: Request<{}, {}, {}>, res: Response) => {\n`;
  content += `\t\tconst { filters, options } = handleFilterQuery(req);\n`;
  content += `\t\tconst response = await ${service}.getAll(filters, options);\n`;
  content += `\t\treturn new OKResponse({\n`;
  content += `\t\t\tmessage: "Lấy danh sách dữ liệu thành công.",\n`;
  content += `\t\t\tmetadata: response.results,\n`;
  content += `\t\t\toptions: {\n`;
  content += `\t\t\t\tlimit: options.limit,\n`;
  content += `\t\t\t\tpage: options.page,\n`;
  content += `\t\t\t\ttotalRows: response.total,\n`;
  content += `\t\t\t\ttotalPage: Math.ceil(response.total / options.limit),\n`;
  content += `\t\t\t},\n`;
  content += `\t\t}).send(res);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm request getById */
  content += `\tgetById = async (req: Request<${inputUpdate}["params"], {}, {}>, res: Response) => {\n`;
  content += `\t\tconst id = req.params.id;\n`;
  content += `\t\tconst response = await ${service}.getById(+id);\n`;
  content += `\t\treturn new OKResponse({\n`;
  content += `\t\t\tmessage: \`Lấy dữ liệu theo id = \${id} thành công.\`,\n`;
  content += `\t\t\tmetadata: response,\n`;
  content += `\t\t}).send(res);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm request update */
  content += `\tupdate = async (\n`;
  content += `\t\treq: Request<${inputUpdate}["params"], {}, ${inputUpdate}["body"]>,\n`;
  content += `\t\tres: Response\n`;
  content += `\t) => {\n`;
  content += `\t\tconst id = req.params.id;\n`;
  content += `\t\tconst response = await ${service}.update(req.body, +id);\n`;
  content += `\t\treturn new OKResponse({\n`;
  content += `\t\t\tmessage: \`Cập nhật dữ liệu theo id = \${id} thành công.\`,\n`;
  content += `\t\t\tmetadata: response,\n`;
  content += `\t\t}).send(res);\n`;
  content += `\t};\n\n`;

  /** Tạo hàm request delete */
  content += `\tdelete = async (req: Request<${inputUpdate}["params"], {}, {}>, res: Response) => {\n`;
  content += `\t\tconst id = req.params.id;\n`;
  content += `\t\tconst response = await ${service}.deleteById(+id);\n`;
  content += `\t\treturn new OKResponse({\n`;
  content += `\t\t\tmessage: \`Xóa dữ liệu theo id = \${id} thành công.\`,\n`;
  content += `\t\t\tmetadata: response,\n`;
  content += `\t\t}).send(res);\n`;
  content += `\t};\n`;
  content += `}\n\n`;

  /** Export controller */
  content += `export default new ${controller}();`;

  // customLog(content);

  const contentIndex = `export { default as ${tableLowercase}Controller } from "./${tableName}.controller";\n`;

  /** Thực hiện ghi nội dung vào file */
  await fs.promises.writeFile(fileController, content, { encoding: "utf-8" });

  /** Thực hiện nối tiếp nội dung vào file */
  await fs.promises.appendFile(fileControllerIndex, contentIndex, { encoding: "utf-8" });

  customLog("Cyan", `CREATE CONTROLLER ${tableName} SUCCESS...`);
};

export const handleCreateRouteWithIndex = (tableNames: string[], fileText = ""): string => {
  if (tableNames.length === 0) return fileText;
  const tableName = tableNames[0];

  /** Chi tách nội dung file ra thành mảng và replace \r */
  let contentArr = fileText
    .split("\n")
    .filter((v) => v && v !== "\r")
    .map((v) => v.replace(/\r/, ""));

  /** lấy dòng đầu tiên của import */
  const firstImport = contentArr[0];

  /** lấy dòng cuối cùng của export */
  const lastExport = contentArr.at(contentArr.length - 1);

  contentArr = contentArr.slice(1, -1);

  /** Tạo nội dung cho route theo tên table */
  const contentImport = `import ${tableName}Route from "./${tableName}.route";`;
  const contentUseRoute = `router.use("/api/v1/${tableName}s", ${tableName}Route);`;

  /** Gộp nội dung lại thành 1 mảng */
  contentArr = [contentImport, ...contentArr, contentUseRoute];

  /** Tạo nội dung mới cho file index route */
  let contentIndex = "";
  contentIndex += `${firstImport}\n`;

  /** Duyệt qua các nội dung bên trong để thêm dấu xuống dòng */
  contentIndex += contentArr.reduce((text, value) => {
    if (value.startsWith("const")) {
      return (text += `\n${value}\n\n`);
    }

    text += `${value}\n`;

    return text;
  }, "");

  contentIndex += `\n${lastExport}`;

  customLog("Orange", `Finished Import Route From Table ${tableName}`);

  return handleCreateRouteWithIndex(tableNames.slice(1), contentIndex);
};

/** @description Tạo nội dung cho file `route` theo tên Table */
const handleCreateRoute = async (tableName: string, fileRoute: string) => {
  const tableLowercase = tableName;
  const controller = `${tableLowercase}Controller`;
  const createSchema = `${tableName}CreateSchema`;
  const updateSchema = `${tableName}UpdateSchema`;

  let content = "";

  /** Import những file cần thiết */
  content += `import { validateResource } from "@/middlewares";\n`;
  content += `import { asyncHandler } from "@/utils";\n`;
  content += `import { ${controller} } from "@/controllers";\n`;
  content += `import { ${createSchema}, ${updateSchema} } from "@/schema";\n`;
  content += `import { Router } from "express";\n\n`;

  /** Tạo ra các route */
  content += `const route = Router();\n\n`;

  /** Gôm nhóm các đường dẫn `/` */
  content += `route\n`;
  content += `\t.route("/")\n`;
  content += `\t.post(\n`;
  content += `\t\tasyncHandler(validateResource(${createSchema})),\n`;
  content += `\t\tasyncHandler(${controller}.create)\n`;
  content += `\t)\n`;
  content += `\t.get(asyncHandler(${controller}.getAll));\n\n`;

  /** Gôm nhóm các đường dẫn `/:id` */
  content += `route\n`;
  content += `\t.route("/:id")\n`;
  content += `\t.patch(\n`;
  content += `\t\tasyncHandler(validateResource(${updateSchema})),\n`;
  content += `\t\tasyncHandler(${controller}.update)\n`;
  content += `\t)\n`;
  content += `\t.delete(asyncHandler(${controller}.delete))\n`;
  content += `\t.get(asyncHandler(${controller}.getById));\n\n`;

  /** Export route */
  content += `export default route;`;

  /** Thực hiện ghi nội dung vào file */
  await fs.promises.writeFile(fileRoute, content, { encoding: "utf-8" });

  customLog("BrightMagenta", `CREATE ROUTE ${tableName} SUCCESS...`);
};

/**
 * @description Run Create `Models`
 * @param value Giá trị được ra khi đã sử lý sql
 * @param rootFolderModel Thư mục gốc của model là thư mục `models`
 * @returns
 */
export async function runCreates(
  value: string,
  folderModel: string,
  folderSchema: string,
  rootFolderService: string,
  rootFolderController: string,
  rootFolderRoute: string
) {
  /** Cắt nhưng khoảng trông */
  const split = value.split(" ");

  /** Tại vị trí thứ 5 thay thế dấu ` sẽ được tên của Table */
  const tableName = split[5].replace(/`/g, "").slice(0, -1);

  customLog("Danger", `CREATE TABLE SUCCESS => ${tableName}`);

  /**
   * 1. Cắt chuỗi split " ( " sẽ tạo ra được 1 mảng gồm có tên Table và trường trong Table
   * 2. slice(1) Loại bỏ tên Table ra khỏi mảng
   * 3. [0] Sau đó lấy phẩn tử thứ 0 sẽ là nhưng trường trong Table.
   * 4. split(", `") Tiếp tục cắt chuỗi để lấy ra tên trường.
   */
  let fileds = value.split(" ( ").slice(1)[0].split(", `");

  /** Lần lược lấy đường dẫn của file model, schema, service và controller theo tên bảng */
  const fileModel = path.join(folderModel + "/" + tableName + FILE_EXTENSION_MODEL);
  const fileSchema = path.join(folderSchema + "/" + tableName + FILE_EXTENSION_SCHEMA);
  const fileService = path.join(rootFolderService + "/" + tableName + FILE_EXTENSION_SERVICE);
  const fileRoute = path.join(rootFolderRoute + "/" + tableName + FILE_EXTENSION_ROUTE);
  const fileController = path.join(
    rootFolderController + "/" + tableName + FILE_EXTENSION_CONTROLLER
  );

  /** Lần lược lấy đường dẫn của file index.ts trong thư mục models, schema, services và controllers */
  const fileModelIndex = path.join(folderModel + "/index.ts");
  const fileSchemaIndex = path.join(folderSchema + "/index.ts");
  const fileServiceIndex = path.join(rootFolderService + "/index.ts");
  const fileControllerIndex = path.join(rootFolderController + "/index.ts");

  /** Nếu file model đã tồn tại thì không làm gì cả */

  const newFileds = fileds
    .map((line) => handleSetup(line))
    .filter((value) => isDataTypesMySQLEnum(value.type));

  // customLog(newFileds);

  if (!fs.existsSync(fileModel)) {
    await handleCreateModel(newFileds, tableName, fileModel, fileModelIndex);
  }

  if (!fs.existsSync(fileSchema)) {
    await handleCreateSchema(newFileds, tableName, fileSchema, fileSchemaIndex);
  }

  if (!fs.existsSync(fileService)) {
    await handleCreateService(newFileds, tableName, fileService, fileServiceIndex);
  }

  if (!fs.existsSync(fileController)) {
    await handleCreateController(tableName, fileController, fileControllerIndex);
  }

  if (!fs.existsSync(fileRoute)) {
    await handleCreateRoute(tableName, fileRoute);
    return tableName;
  }
}
