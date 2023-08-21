const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

AWS.config.update({
    region: process.env.COGNITO_REGION
});

const cognito = new AWS.CognitoIdentityServiceProvider();

async function signUpUser(number, password, name, email, userPoolId, clientId) {
    const params = {
        ClientId: clientId,
        Username: number,
        Password: password,
        UserAttributes: [
            { Name: "name", Value: name },
            { Name: "email", Value: email }
        ],
    };

    try {
        const data = await cognito.signUp(params).promise();
        console.log('User successfully signed up:', data);
        return data;
    } catch (error) {
        console.error('Error signing up user:', error.message);
        throw error;
    }
}

exports.lambdaHandler = async (event) => {
    const body = JSON.parse(event.body);
    const { number, password, name, email } = body;
    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;
        const result = await signUpUser(number, password, name, email, userPoolId, clientId);

        const userId = result.UserSub
        if (!userId) {
            return {
                statusCode: 404,
                body: JSON.stringify("userID is not found")
            }
        }

        const params = {
            TableName: "emoease-table",
            Item: {
                id: userId,
                email: email,
                name: name,
                number: number
            }
        }

        await dynamodb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User successfully signed up', data: result }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error signing up user', message: error.message }),
        };
    }
};
