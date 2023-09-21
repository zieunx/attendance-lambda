import Response from "../common/Response.mjs";
import SlackClient from "../infra/SlackClient.mjs";

export const initMessagesHandler = async (event) => {
  const slackResponse = await SlackClient.findChannelMessages(
      SlackClient.attendanceChannelCode
  );

  console.log("")

  return Response.success({
    message: "initMessages",
  });
};
