const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.lambdaHandler = async (event) => {
    const username = event.queryStringParameters.username;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const containsEmail = emailPattern.test(username);

    if (!username || username.trim().length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify("Username is not entered")
        };
    }

    try {
        const getUserParams = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Filter: containsEmail ? `email = "${username}"` : `phone_number = "${username}"`,
            Limit: 1
        };

        const userQueryResponse = await cognito.listUsers(getUserParams).promise();
        if (userQueryResponse.Users && userQueryResponse.Users.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify("User not found")
            };
        }
        const params = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: username,
        };

        const data = await cognito.forgotPassword(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Password reset initiated", data })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
