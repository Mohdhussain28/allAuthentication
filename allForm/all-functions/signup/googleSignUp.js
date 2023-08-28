const axios = require("axios");
const qs = require("qs")
exports.lambdaHandler = async (event) => {
    const body = JSON.parse(event.body);
    const { googleCode, email, name } = body;
    console.log("meesaa:->", body)
    try {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

        // Exchange Google authorization code for access token using Axios
        const tokenResponse = await axios.post(
            'https://accounts.google.com/o/oauth2/token',
            qs.stringify({
                code: googleCode,
                client_id: googleClientId,
                client_secret: googleClientSecret,
                redirect_uri: googleRedirectUri,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const tokenData = tokenResponse.data;
        const googleAccessToken = tokenData.access_token;
        console.log("messs=>", googleAccessToken)
        // Fetch user information using the access token
        const userInfoResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
            params: {
                access_token: googleAccessToken,
            },
        });

        const userInfo = userInfoResponse.data;
        // Here, you can use the `userInfo` to sign up the user in your system or take further actions.

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User signed up successfully', userInfo, googleAccessToken }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error signing up user', message: error.message }),
        };
    }
};
