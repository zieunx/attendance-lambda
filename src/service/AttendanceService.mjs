import AttendanceRepository from "../repository/AttendanceRepository.mjs";
import UserRepository from "../repository/UserRepository.mjs";
import SlackClient from "../infra/SlackClient.mjs";

/**
 * 문자 혹은 숫자의 timestamp를 한국시간 문자열로 리턴한다. (2023-08-12T11:24:46.000+09:00)
 * @param row
 * @returns {string}
 */
const getKoreanDateString = (row) => {
  const timestamp = Math.floor(typeof row === 'string' ? parseFloat(row) : row);
  const date = new Date(timestamp * 1000);
  const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  const koreanDateString = koreanDate.toISOString().replace("Z", "+09:00");
  return koreanDateString;
}

/**
 * 메시지 내용을 출석 정보로 만들어 리턴한다.
 * @param attachment
 * @returns {{commitContent: *, commitUrl: string, userGithubUrl: string, userGithubId: string, repositoryUrl: *}}
 */
const getAttendanceInfo = (attachment) => {
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
  static async findAll() {
    await AttendanceRepository.findAll();
  }
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
        const koreanDateString = getKoreanDateString(row.ts);
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
      const repositoryResult = await AttendanceRepository.putItem(attendance);
      console.log(
        "[AttendanceService] repository result code: ",
        repositoryResult.$metadata.httpStatusCode
      );
    }
  }

  static async createAttendance(requestBody) {
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
    } = getAttendanceInfo(attachment);

    const attendance = {
      commitUrl,
      commitContent,
      repositoryUrl,
      userGithubUrl,
      userGithubId,
      eventDateTime: getKoreanDateString(requestBody.event_time),
    };

    // 출석 채널이 아니면 데이터를 저장하지 않음.
    const isTest = typeof requestBody.test !== 'undefined' && requestBody.test === true
    const isNotAttendanceChannel = !requestBody.event.channel || requestBody.event.channel !== SlackClient.attendanceChannelCode
    if (isTest || (isNotAttendanceChannel)) {
      return;
    }
    const repositoryResult = await AttendanceRepository.putItem(attendance);
    console.log(
      "[AttendanceService] repository result code: ",
      repositoryResult.$metadata.httpStatusCode
    );

    if (repositoryResult.$metadata.httpStatusCode == 200) {
      const user = await UserRepository.findByGitId(userGithubId);

      console.log("중간점검 SlackClient.testChannelUrl:" + SlackClient.testChannelUrl);

      await SlackClient.sendMessage(
        SlackClient.testChannelUrl,
        SlackClient.getAttachments(user, attendance)
      );
    }
  }
}
