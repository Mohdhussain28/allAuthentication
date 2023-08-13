
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.COGNITO_REGION
});

const cognito = new AWS.CognitoIdentityServiceProvider();

async function signUpUser(username, password, email, userPoolId, clientId) {
    const params = {
        ClientId: clientId,
        Username: username,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            // You can add more attributes as needed
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
    const { username, password, email } = body;

    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;
        const result = await signUpUser(username, password, email, userPoolId, clientId);
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
