import AttendanceRepository from "../../../src/repository/AttendanceRepository.mjs";

import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

describe("Test getAllItemsHandler", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  it("should created attendance", async () => {
    // given
    const returnedItem = { id: "id1", name: "name1" };

    ddbMock.on(PutCommand).resolves({
      returnedItem,
    });

    const event = {
      httpMethod: "POST",
      body: '{"id": "id1","name": "name1"}',
    };

    // when
    const result = await AttendanceRepository.putItem(event);

    // then
    const expectedResult = { returnedItem: returnedItem };

    expect(result).toEqual(expectedResult);
  });
});
