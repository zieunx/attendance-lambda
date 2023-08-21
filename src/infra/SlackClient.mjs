import { post } from "axios";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

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
  static TEST_CHANNEL_URL =
    "https://hooks.slack.com/services/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";

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
      "[SlackClient] url: " + url + ", data: " + JSON.stringify(data)
    );

    try {
      const response = await post(url, data, {
        headers: DEFAULT_HEADERS,
      });
      console.log("[SlackClient] Response:", response.data);
    } catch (error) {
      console.error("[SlackClient] Error:", error);
    }
  }
}
