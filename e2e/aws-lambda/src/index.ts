import { createTestServerAdapter } from '@e2e/shared-server';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const app = createTestServerAdapter();

export async function handler(event: APIGatewayEvent, lambdaContext: Context): Promise<APIGatewayProxyResult> {
  const url = new URL(event.path, 'http://localhost');
  if (event.queryStringParameters != null) {
    for (const name in event.queryStringParameters) {
      const value = event.queryStringParameters[name];
      if (value != null) {
        url.searchParams.set(name, value);
      }
    }
  }

  const response = await app.fetch(
    url,
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
    },
    {
      event,
      lambdaContext,
    }
  );

  const responseHeaders: Record<string, string> = {};

  response.headers.forEach((value, name) => {
    responseHeaders[name] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
    isBase64Encoded: false,
  };
}