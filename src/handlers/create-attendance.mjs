import { createAttendance } from "../service/AttendanceService.mjs";
import { success } from "../common/Response.mjs";

export const createAttendanceHandler = async (event) => {
  const requestBody = JSON.parse(event.body);
  // const requestBody = event;
  console.log("[index] event: ", JSON.stringify(event));
  console.log("[index] requestBody: ", JSON.stringify(requestBody));
  if (requestBody.type == "url_verification") {
    return success({
      challenge: requestBody.challenge,
    });
  }

  await createAttendance(requestBody);

  return success({
    message: "createAttendance",
  });
};
