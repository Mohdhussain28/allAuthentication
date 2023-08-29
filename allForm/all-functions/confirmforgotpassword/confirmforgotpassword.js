const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.lambdaHandler = async (event) => {

    const body = JSON.parse(event.body)
    const { code, newPassword, username } = body
    if (!code || !newPassword || !username) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Please fill all the required field" })
        }
    }
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        ConfirmationCode: code,
        Password: newPassword,
        Username: username
    }
    try {
        const data = await cognito.confirmForgotPassword(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify("successfully password change", data)
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        }
    }
}