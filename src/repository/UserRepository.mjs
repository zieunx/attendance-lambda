import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = new DynamoDBClient({ region: "ap-northeast-2" });
const docClient = DynamoDBDocumentClient.from(ddbDocClient);
const gitConnectionTableName = "GitConnection";
const userTableName = "User";

const getGitConnection = async (gitId) => {
  const command = new QueryCommand({
    TableName: gitConnectionTableName,
    KeyConditionExpression: "gitId = :gitId",
    ExpressionAttributeValues: {
      ":gitId": gitId,
    },
    ConsistentRead: true,
  });

  const result = await docClient.send(command);

  return result["Items"][0];
};

export default class UserRepository {
  static async findByGitId(gitId) {
    const gitConnection = await getGitConnection(gitId);
    console.log(
      "[UserRepository] gitConnection: " + JSON.stringify(gitConnection)
    );
    const command = new QueryCommand({
      TableName: userTableName,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": gitConnection.userId,
      },
      ConsistentRead: true,
    });

    const result = await docClient.send(command);

    return result["Items"][0];
  }
}
