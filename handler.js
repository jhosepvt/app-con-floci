const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Floci/LocalStack inyecta LOCALSTACK_HOSTNAME dentro del contenedor de la Lambda
const host = process.env.LOCALSTACK_HOSTNAME || 'localhost';
const endpoint = process.env.AWS_ENDPOINT_URL || `http://${host}:4566`;

const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: endpoint,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Obtener tareas (GET)
module.exports.getTareas = async () => {
  try {
    const command = new ScanCommand({ TableName: 'Tareas' });
    const response = await docClient.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response.Items || [])
    };
  } catch (error) {
    console.error('Error en GET /tareas-dynamo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Crear tarea (POST)
module.exports.createTarea = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    if (!body.descripcion) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'La descripción es requerida' })
      };
    }

    const item = {
      id: body.id || Date.now().toString(),
      descripcion: body.descripcion
    };

    await docClient.send(new PutCommand({ TableName: 'Tareas', Item: item }));

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Tarea guardada en DynamoDB', item })
    };
  } catch (error) {
    console.error('Error en POST /tareas-dynamo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Eliminar tarea (DELETE)
module.exports.eliminarTarea = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'El ID de la tarea es requerido' })
      };
    }

    await docClient.send(new DeleteCommand({
      TableName: 'Tareas',
      Key: { id }
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Tarea eliminada de DynamoDB', id })
    };
  } catch (error) {
    console.error('Error en DELETE /tareas-dynamo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};