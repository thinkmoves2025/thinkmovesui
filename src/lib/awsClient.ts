import { LambdaClient, LambdaClientConfig } from '@aws-sdk/client-lambda';

// Initialize AWS Lambda client
const client = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
} as LambdaClientConfig);

export { client };
