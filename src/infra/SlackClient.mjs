import axios from "axios";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const authToken = process.env.SLACK_AUTHORIZATION_TOKEN;
const incomingWebhookUrl = process.env.SLACK_INCOMING_WEBHOOK_URL;

const getCurrentDate = (dateString) => {
  var now = null;
  if (dateString == null) {
    const newDate = new Date();
    newDate.setMilliseconds(now.getMilliseconds() + 32400000); // 한국은 UTC+9 이므로 9시간(32400000 밀리초)를 더한다.
    now = newDate;
  } else {
    now = new Date(dateString);
  }

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} (${hours}:${minutes}:${seconds})`;

  return formattedDate;
};

export default class SlackClient {
  static slackWebhookUrl = incomingWebhookUrl;
  static attendanceChannelCode = "C05E427CX7U";

  static getAttachments = (user, attendance) => {
    return [
      {
        mrkdwn_in: ["text"],
        color: user.color,
        pretext: "*출석 완료!*",
        author_name: user.realName,
        author_icon: user.image,
        fields: [
          {
            title: "출석일시",
            value: getCurrentDate(attendance.eventDateTime),
            short: false,
          },
          {
            title: "출석횟수",
            value: "-",
            short: true,
          },
          {
            title: "결석횟수",
            value: "-",
            short: true,
          },
        ],
      },
    ];
  };

  static async sendMessage(url, attachments) {
    const data = {
      attachments: attachments,
    };

    console.log(
      `[SlackClient] url ${url}, data: ${JSON.stringify(data)}`
    );

    try {
      const response = await axios.post(url, data, {
        headers: DEFAULT_HEADERS,
      });
      console.log("[SlackClient] Response:", response.data);
    } catch (error) {
      console.error("[SlackClient] Error:", error);
    }
  }

  static async findChannelMessages(channelCode) {
        try {
          const response = await axios.get(
              `https://slack.com/api/conversations.history?channel=${channelCode}&pretty=1`,
              {
                headers: {
                  "Authorization": "Bearer " + authToken,
                  ...DEFAULT_HEADERS
                }
              }
          );
          return response;
        } catch (error) {
          console.error("[SlackClient] Error:", error);
        }
  }
}
