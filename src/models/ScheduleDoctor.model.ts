import { Model } from "@/lib";
import { getHourAndMinus } from "@/utils";
import { intervalToDuration } from "date-fns";
import { HourObject } from "./HourObject.model";

export interface ScheduleDoctor {
  id?: string;
  session_checkup_id: number;
  date: string;
  doctor_id: string;
  status?: "active" | "inactive" | "complete";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

type CreateHourPayload = {
  hourStart: number;
  minuteStart: number;
  timeCheckupAvg: number;
  shifts: any[];
  results: any[];
};

const createHour = ({
  hourStart,
  minuteStart,
  shifts,
  timeCheckupAvg,
  results,
}: CreateHourPayload): { end: string; start: string }[] => {
  if (shifts.length === 0) {
    return results;
  }

  if (results.length) {
    minuteStart += timeCheckupAvg;

    if (minuteStart >= 60) {
      hourStart += 1;

      if (minuteStart === 60) {
        minuteStart = 0;
      }

      if (minuteStart > 60) {
        minuteStart -= 60;
      }
    }
  }

  let _minuteEnd = minuteStart + timeCheckupAvg;
  let _hourEnd = hourStart;

  if (_minuteEnd > 60) {
    _minuteEnd -= 60;
    _hourEnd += 1;
  }

  if (_minuteEnd === 60) {
    _minuteEnd = 0;
    _hourEnd += 1;
  }

  results.push({
    start: `${hourStart < 10 ? `0${hourStart}` : hourStart}:${
      minuteStart === 0 ? "00" : minuteStart
    }`,
    end: `${_hourEnd < 10 ? `0${_hourEnd}` : _hourEnd}:${_minuteEnd === 0 ? "00" : _minuteEnd}`,
  });

  return createHour({
    hourStart,
    minuteStart,
    shifts: shifts.slice(1),
    timeCheckupAvg,
    results,
  });
};

const getHours = (startHour: Date, endHour: Date) => {
  let results: never[] = [];

  const totalTimers = intervalToDuration({ end: endHour, start: startHour });
  const timeCheckupAvg = 15;

  const shiftCheckup = Math.floor(
    (totalTimers.hours! * 60 + totalTimers.minutes!) / timeCheckupAvg
  );

  const shifts = createHour({
    hourStart: startHour.getHours(),
    minuteStart: startHour.getMinutes(),
    shifts: [...Array(shiftCheckup)],
    timeCheckupAvg: timeCheckupAvg,
    results,
  });

  const hours: HourObject[] = shifts.map((shift) => ({
    id: `${Math.random()}`,
    is_booked: false,
    time_end: shift.end,
    time_start: shift.start,
    is_remove: false,
    is_cancel: false,
    is_over_time: false,
  }));

  return hours;
};

class ScheduleDoctorModel extends Model {
  protected table: string = "ScheduleDoctors";

  protected fillables: string[] = [
    "id",
    "session_checkup_id",
    "doctor_id",
    "date",
    "status",
    "deleted_at",
  ];

  protected timestamps: boolean = false;

  get getFillables() {
    return this.fillables;
  }

  get getTable() {
    return this.table;
  }

  get getTimestamps() {
    return this.timestamps;
  }

  public schedulesHour = () => {
    const startMorning = getHourAndMinus(7, 30);
    const endMorning = getHourAndMinus(11, 30);
    const startAfternoon = getHourAndMinus(13, 30);
    const endAfternoon = getHourAndMinus(20, 0);

    const hoursMorning = getHours(startMorning, endMorning);
    const hoursAfter = getHours(startAfternoon, endAfternoon);

    return [...hoursMorning, ...hoursAfter];
  };
}

export default new ScheduleDoctorModel();
