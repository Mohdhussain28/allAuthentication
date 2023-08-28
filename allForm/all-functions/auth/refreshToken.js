const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.COGNITO_REGION });

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.lambdaHandler = async (event) => {

    const oldRefreshToken = event.queryStringParameters.oldRefreshToken;
    if (!oldRefreshToken) {
        return {
            statusCode: 401,
            body: JSON.stringify("refresh token is required for renewal")
        }
    }
    const params = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            'REFRESH_TOKEN': oldRefreshToken
        }
    }

    try {
        const data = await cognito.initiateAuth(params).promise();
        const newIdToken = data.AuthenticationResult.IdToken;
        const newRefreshToken = data.AuthenticationResult.RefreshToken;
        const expiresIn = data.AuthenticationResult.ExpiresIn;

        return {
            statusCode: 200,
            body: JSON.stringify("suceesfully token refreshed", newIdToken, newRefreshToken, expiresIn)
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        }
    }

}