const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const changepassword = async (accessToken, previousPassword, newPassword) => {

    const params = {
        AccessToken: accessToken,
        PreviousPassword: previousPassword,
        ProposedPassword: newPassword
    }
    try {
        const data = await cognito.changePassword(params).promise();
        console.log("daaaa=>", data)
        return data;
    }
    catch (error) {
        throw error;
    }
}

exports.lambdaHandler = async (event) => {
    const body = JSON.parse(event.body);
    const accessToken = event.headers['Authorization'];
    const { previousPassword, newPassword } = body;
    if (!previousPassword || !newPassword) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Please provide access token, previous password, and new password" })
        };
    }

    try {
        const response = await changepassword(accessToken, previousPassword, newPassword);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Password changed successfully", data: response })
        }
    } catch (error) {
        return {
            statusCode: error.code,
            body: JSON.stringify({ message: error.message })
        }
    }
}
