import Response from "../common/Response.mjs";
import AttendanceService from "../service/AttendanceService.mjs";
import AttendanceGroupingService from "../service/AttendanceGroupingService.mjs";

export const attendanceGroupingByDateHandler = async (event) => {
  const list = await AttendanceService.findAll();

  await AttendanceGroupingService.groupingByDate(list);

  return Response.success({
    message: "countAttendance",
  });
};
