import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import SlackClient from "../../../src/infra/SlackClient.mjs";

const mock = new AxiosMockAdapter(axios);

describe("SlackClient", () => {
  afterEach(() => {
    mock.reset();
  });

  it("sendMessage sends the correct data", async () => {
    const mockURL = "https://mockurl.com/test";
    const mockAttachments = [{ data: "test" }];

    mock.onPost(mockURL).reply(200, { result: "success" });

    await SlackClient.sendMessage(mockURL, mockAttachments);

    expect(mock.history.post.length).toBe(1);
    const postData = JSON.parse(mock.history.post[0].data);

    expect(postData).toEqual({ attachments: mockAttachments });
  });
});
