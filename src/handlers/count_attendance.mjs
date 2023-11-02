import Response from "../common/Response.mjs";
import AttendanceService from "../service/AttendanceService.mjs";

export const countAttendanceHandler = async (event) => {
  const result = await AttendanceService.createAttendanceByExistMessages();

  return Response.success({
    message: "initMessages",
  });
};
