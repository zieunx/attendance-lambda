import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = new DynamoDBClient({ region: "ap-northeast-2" });
const docClient = DynamoDBDocumentClient.from(ddbDocClient);
const AttendanceTableName = process.env.ATTENDANCE_TABLE;

import { randomBytes } from "crypto";
function generateUUID() {
  return randomBytes(16).toString("hex");
}

export default class AttendanceRepository {
  static async findAll() {
    return await docClient.send(
        new QueryCommand({
          TableName: AttendanceTableName
        })
    );
  }

  static async putItem(item) {
    console.log("테이블명:" + AttendanceTableName);
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
