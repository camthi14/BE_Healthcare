import {
  BookingModel,
  DoctorModel,
  EmployeeModel,
  ExaminationCardModel,
  PatientModel,
} from "@/models";
import { raw } from "mysql2";

class ReportService {
  public static dashboard = async () => {
    const patient = await PatientModel.count({});
    const doctor = await DoctorModel.count({});
    const employee = await EmployeeModel.count();
    const isBooked = await BookingModel.count({ status: raw("NOT IN ('canceled')") });
    const isCanceled = await BookingModel.count({ status: "canceled" });
    const examinationCard = await ExaminationCardModel.count({ status: "complete" });

    return { patient, doctor, employee, isBooked, isCanceled, examinationCard };
  };
}

export default ReportService;
