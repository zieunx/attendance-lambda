import AttendanceService from "../service/AttendanceService.mjs";
import Response from "../common/Response.mjs";

export const createAttendanceHandler = async (event) => {
  console.log("테스트 ", event);
  const requestBody = JSON.parse(event.body);
  // const requestBody = event;
  console.log("[index] event: ", JSON.stringify(event));
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
