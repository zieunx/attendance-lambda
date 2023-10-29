import Response from "../common/Response.mjs";
import AttendanceService from "../service/AttendanceService.mjs";

export const initMessagesHandler = async (event) => {
  const result = await AttendanceService.createAttendanceByExistMessages();

  return Response.success({
    message: "initMessages",
  });
};
