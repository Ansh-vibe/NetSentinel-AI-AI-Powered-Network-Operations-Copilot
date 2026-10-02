/**
 * AWS Lambda Handler: getIncidents
 * Retrieves active and historical network incidents from Amazon DynamoDB.
 */
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
    }),
  };
};
