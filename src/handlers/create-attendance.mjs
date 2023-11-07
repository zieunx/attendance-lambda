import AttendanceService from "../service/AttendanceService.mjs";
import Response from "../common/Response.mjs";

export const createAttendanceHandler = async (event) => {
  const requestBody = JSON.parse(event.body);
  console.log("[index] requestBody: ", JSON.stringify(requestBody));
  if (requestBody.type == "url_verification") {
    return Response.success({
      challenge: requestBody.challenge,
    });
  }

  await AttendanceService.createAttendance(requestBody);

  return Response.success({
    message: "createAttendance",
  });
};
