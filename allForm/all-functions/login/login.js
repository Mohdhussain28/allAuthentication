const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.COGNITO_REGION
});

const cognito = new AWS.CognitoIdentityServiceProvider();

async function loginUser(username, password, userPoolId, clientId) {

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();
        console.log('User successfully logged in:', data);
        return { message: 'User successfully logged in' };
    } catch (error) {
        console.error('Error logging in user:', error.message);
        throw error;
    }
}

exports.lambdaHandler = async (event) => {
    // const body = JSON.parse(event.body);
    const username = event.queryStringParameters.username;
    const password = event.queryStringParameters.password;
    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;

        const result = await loginUser(username, password, userPoolId, clientId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User successfully logged in', data: result }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error logging in user', message: error.message }),
        };
    }
};