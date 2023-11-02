import AttendanceRepository from "../repository/AttendanceRepository.mjs";
import UserRepository from "../repository/UserRepository.mjs";
import SlackClient from "../infra/SlackClient.mjs";

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

function getKoreanDateString(row) {
  const timestampInMillis = row.ts * 1000;
  const date = new Date(timestampInMillis);
  const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  const koreanDateString = koreanDate.toISOString().replace("Z", "+09:00");
  return koreanDateString;
}

function getAttendanceInfo(attachment) {
  let commitUrl = "";
  const commitUrlMatch = attachment.pretext.match(/<([^|>]+)\|[^>]+>/);
  if (commitUrlMatch) {
    commitUrl = commitUrlMatch[1];
  }
  const commitContent = attachment.text;
  const repositoryUrl = attachment.footer.match(/<([^|]+)\|/)[1];

  const userMatch = attachment.pretext.match(/<([^|>]+)\|([^>]+)>$/);
  let userGithubUrl = "";
  let userGithubId = "";
  if (userMatch) {
    userGithubUrl = userMatch[1];
    userGithubId = userMatch[2];
  }

  return {commitUrl, commitContent, repositoryUrl, userGithubUrl, userGithubId};
}

export default class AttendanceService {
  static async createAttendanceByExistMessages() {
    const slackResponse = await SlackClient.findChannelMessages(SlackClient.attendanceChannelCode);

    if (!slackResponse.data.ok) {
      console.error("[slack error] " ,slackResponse.data);
      return
    }

    const list = slackResponse.data.messages
      .filter(row => row.bot_id === "B05DPFWDXFH")
      .filter(row => !!row.attachments && row.attachments.length > 0)
      .map((row) => {
        const attachment = row.attachments[0];

        const {
          commitUrl,
          commitContent,
          repositoryUrl,
          userGithubUrl,
          userGithubId
        } = getAttendanceInfo(attachment);
        const koreanDateString = getKoreanDateString(row);
        return {
          commitUrl,
          commitContent,
          repositoryUrl,
          userGithubUrl,
          userGithubId,
          eventDateTime: koreanDateString
        };
      })
      .filter(obj =>
         !!obj.commitUrl && !!obj.commitContent && !!obj.repositoryUrl && !!obj.userGithubUrl && !!obj.userGithubId && !!obj.eventDateTime
      );
    for (const attendance of list) {
      console.log("attendance3: ", JSON.stringify(attendance));
      const repositoryResult = await AttendanceRepository.putItem(attendance);
      console.log(
        "[AttendanceService] repository result code: ",
        repositoryResult.$metadata.httpStatusCode
      );

      if (repositoryResult.$metadata.httpStatusCode == 200) {
        const user = await UserRepository.findByGitId(attendance.userGithubId);
        console.log("[AttendanceService] user: ", JSON.stringify(user));

        await SlackClient.sendMessage(
          SlackClient.testChannelUrl,
          SlackClient.getAttachments(user, attendance)
        );
      }
    }
  }

  static async createAttendance(requestBody) {
    console.log(
      "[AttendanceService] requestBody: ",
      JSON.stringify(requestBody)
    );
    if (!requestBody.event || !requestBody.event.attachments) {
      return;
    }
    const attachment = requestBody.event.attachments[0];

    const {
      commitUrl,
      commitContent,
      repositoryUrl,
      userGithubUrl, 
      userGithubId
    } = await this.getAttendanceInfo(attachment);

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
    const repositoryResult = await AttendanceRepository.putItem(attendance);
    console.log(
      "[AttendanceService] repository result code: ",
      repositoryResult.$metadata.httpStatusCode
    );

    if (repositoryResult.$metadata.httpStatusCode == 200) {
      const user = await UserRepository.findByGitId(userGithubId);
      console.log("[AttendanceService] user: ", JSON.stringify(user));

      await SlackClient.sendMessage(
        SlackClient.testChannelUrl,
        SlackClient.getAttachments(user, attendance)
      );
    }
  }
}
