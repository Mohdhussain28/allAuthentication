const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.COGNITO_REGION
});

const cognito = new AWS.CognitoIdentityServiceProvider();

async function verifyOTP(username, otp, userPoolId, clientId) {
    const params = {
        ClientId: clientId,
        Username: username,
        ConfirmationCode: otp,
    };

    try {
        await cognito.confirmSignUp(params).promise();
        console.log('User successfully verified OTP');
        return { message: 'User successfully verified OTP' };
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        throw error;
    }
}

exports.lambdaHandler = async (event) => {
    const body = JSON.parse(event.body);
    const { username, otp } = body;

    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;

        const result = await verifyOTP(username, otp, userPoolId, clientId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User successfully verified OTP', data: result }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error verifying OTP', message: error.message }),
        };
    }
};
