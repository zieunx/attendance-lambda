import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = new DynamoDBClient({ region: "ap-northeast-2" });
const docClient = DynamoDBDocumentClient.from(ddbDocClient);
const tableName = process.env.ATTENDANCE_GROUPING_DATE_TABLE;

export default class AttendanceGroupingDateRepository {
    static async putItem({ userGithubId, date }) {
        console.log(`테이블 명: ${tableName}`);
        const putParams = {
            TableName: tableName,
            Item: {
                userGithubId,
                date
            },
        };

        return await docClient.send(new PutCommand(putParams));
    }
}
