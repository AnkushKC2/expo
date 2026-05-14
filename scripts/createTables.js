/**
 * Run once to create the two DynamoDB tables:
 *   node scripts/createTables.js
 *
 * Requires AWS credentials in .env or IAM role.
 */
require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const tables = [
  {
    TableName:            process.env.DYNAMO_USERS_TABLE || 'scada_users',
    KeySchema:            [{ AttributeName: 'email', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    BillingMode:          'PAY_PER_REQUEST',
  },
  {
    TableName:            process.env.DYNAMO_AUDIT_TABLE || 'scada_audit_logs',
    KeySchema: [
      { AttributeName: 'id',        KeyType: 'HASH'  },
      { AttributeName: 'createdAt', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id',        AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch { return false; }
}

(async () => {
  for (const def of tables) {
    const exists = await tableExists(def.TableName);
    if (exists) {
      console.log(`⏭   Table already exists: ${def.TableName}`);
    } else {
      await client.send(new CreateTableCommand(def));
      console.log(`✅  Created table: ${def.TableName}`);
    }
  }
  console.log('\nDone. You can now run: npm start\n');
})();
