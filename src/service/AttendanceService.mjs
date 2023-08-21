import { putItem } from "../repository/AttendanceRepository.mjs";
import { findByGitId } from "../repository/UserRepository.mjs";
import {
  sendMessage,
  TEST_CHANNEL_URL,
  getAttachments,
} from "../infra/SlackClient.mjs";

const ATTENDANCE_CHANNEL_CODE = "C05E427CX7U";

const getCurrentDate = () => {
  const now = new Date();

  // 한국은 UTC+9 이므로 9시간(32400000 밀리초)를 더한다.
  now.setMilliseconds(now.getMilliseconds() + 32400000);

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} (${hours}:${minutes}:${seconds})`;

  return formattedDate;
};

export default class AttendanceService {
  static async createAttendance(requestBody) {
    console.log(
      "[AttendanceService] requestBody: ",
      JSON.stringify(requestBody)
    );
    if (!requestBody.event || !requestBody.event.attachments) {
      return;
    }
    const attachment = requestBody.event.attachments[0];

    // Extracting the desired values
    const commitUrl = attachment.text.match(/<([^|]+)\|/)[1];
    const commitContent = attachment.text.split(" - ")[1];
    const repositoryUrl = attachment.footer.match(/<([^|]+)\|/)[1];

    const userMatch = attachment.pretext.match(/<([^|]+)\|([^>]+)>$/);
    const userGithubUrl = userMatch[1];
    const userGithubId = userMatch[2];

    const eventTime = requestBody.event_time;
    const eventDateTimeUTC = new Date(eventTime * 1000);
    eventDateTimeUTC.setHours(eventDateTimeUTC.getHours() + 9);

    const attendance = {
      commitUrl,
      commitContent,
      repositoryUrl,
      userGithubUrl,
      userGithubId,
      eventDateTime: eventDateTimeUTC.toISOString(),
    };

    console.log("[AttendanceService] attendance: ", attendance);

    // 출석 채널이 아니면 데이터를 저장하지 않음.
    // if (!requestBody.event.channel || requestBody.event.channel != ATTENDANCE_CHANNEL_CODE) {
    // return;
    // }
    const repositoryResult = await putItem(attendance);
    console.log(
      "[AttendanceService] repository result code: ",
      repositoryResult.$metadata.httpStatusCode
    );

    if (repositoryResult.$metadata.httpStatusCode == 200) {
      const user = await findByGitId(userGithubId);
      console.log("[AttendanceService] user: ", JSON.stringify(user));

      await sendMessage(TEST_CHANNEL_URL, getAttachments(user, attendance));
    }
  }
}
