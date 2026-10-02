/**
 * AWS Lambda Handler: health
 * Health check probe for API Gateway.
 */
export const handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      service: 'NetSentinel AI Operations Engine',
      version: '1.0.0',
    }),
  };
};
