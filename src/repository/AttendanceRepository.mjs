import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = new DynamoDBClient({ region: "ap-northeast-2" });
const docClient = DynamoDBDocumentClient.from(ddbDocClient);
const AttendanceTableName = process.env.SAMPLE_TABLE;

import { randomBytes } from "crypto";
function generateUUID() {
  return randomBytes(16).toString("hex");
}

export default class AttendanceRepository {
  static async putItem(item) {
    const putParams = {
      TableName: AttendanceTableName,
      Item: {
        attendanceId: generateUUID(),
        ...item,
      },
    };

    return await docClient.send(new PutCommand(putParams));
  }
}
