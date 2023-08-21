const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
AWS.config.update({
    region: process.env.COGNITO_REGION
});
const cognito = new AWS.CognitoIdentityServiceProvider();

async function loginUser(username, password, userPoolId, clientId) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const containsEmail = emailPattern.test(username);
    let number = null;

    if (containsEmail) {
        const params = {
            TableName: 'emoease-table',
        };

        const data = await dynamoDB.scan(params).promise();
        const scannedItems = data.Items
        for (const item of scannedItems) {
            if (item.email === username) {
                number = item.number;
                break;
            }
            else {
                number = username
            }
        }
    }

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: containsEmail ? number : username,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();
        const authToken = data.AuthenticationResult.IdToken;
        const refreshToken = data.AuthenticationResult.RefreshToken;
        const expiresIn = data.AuthenticationResult.ExpiresIn;
        console.log('User successfully logged in:', data);

        return { message: 'User successfully logged in', authToken, refreshToken, expiresIn };
    } catch (error) {
        console.error('Error logging in user:', error.message);
        throw error;
    }

}
exports.lambdaHandler = async (event) => {
    const username = event.queryStringParameters?.username;
    const password = event.queryStringParameters?.password;

    if (!username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Both username and password are required" })
        }
    }
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
            statusCode: 400 || error,
            body: JSON.stringify({ message: error.message }),
        };
    }
}

