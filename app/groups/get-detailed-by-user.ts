import { DynamoDB } from 'aws-sdk';
import { apiWrapper, ApiSignature } from '@manwaring/lambda-wrapper';
import { GroupRecord, DetailedGroupResponse, GROUP_TYPE_PREFIX } from './group';
import { ProfileResponse, ProfileRecord, PROFILE_TYPE_PREFIX } from './profile';

const groups = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const handler = apiWrapper(async ({ path, success, error }: ApiSignature) => {
  try {
    const response = await getDetailedGroupByUser(path.userId, path.groupId);
    success(response);
  } catch (err) {
    error(err);
  }
});

async function getDetailedGroupByUser(userId: string, groupId: string): Promise<any> {
  const params = {
    TableName: process.env.GROUPS_TABLE,
    KeyConditionExpression: '#groupId = :groupId',
    ExpressionAttributeNames: { '#groupId': 'groupId' },
    ExpressionAttributeValues: { ':groupId': `${groupId}` }
  };
  console.log('Getting group detail and members with params', params);
  const items = await groups
    .query(params)
    .promise()
    .then(res => res.Items);
  const group = new GroupRecord(items.find(item => item.type.indexOf(GROUP_TYPE_PREFIX) > -1));
  const profile = new ProfileRecord(
    items.find(item => item.type.indexOf(PROFILE_TYPE_PREFIX) > -1 && item.userId === userId)
  ).getProfileResponse();
  const profiles = items
    .filter(item => item.type.indexOf(PROFILE_TYPE_PREFIX) > -1 && item.userId !== userId)
    .map(item => new ProfileRecord(item).getProfileResponse());
  return new DetailedGroupResponse(group, profiles, profile);
}
