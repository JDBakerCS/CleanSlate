const { encrypt, decrypt } = require("../utils/tokenEncryption");
const { google } = require("googleapis");
require("dotenv").config();


const googleTokenRefresh = async (row) => {

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const BUFFER = 2 * 60 * 1000;
    const REFRESH_TIMEOUT = 10 * 1000;

    if (Date.now() >= row.accessTokenExpiresAt.getTime() - BUFFER) {
        try {
            oauth2Client.setCredentials({
                refresh_token: decrypt(row.encryptedRefreshToken)
            });

            const { token } = await Promise.race([
                oauth2Client.getAccessToken(),

                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Google token refresh timed out")), REFRESH_TIMEOUT);
                })
            ]);
            const expirationDate = oauth2Client.credentials.expiry_date;

            await row.update({
                encryptedAccessToken: encrypt(token),
                accessTokenExpiresAt: new Date(expirationDate)
            });

            return token;

        } catch (err) {
            await row.update({
                authorizationStatus: "reauthorization_required"
            });

            throw new Error("Google refresh token is invalid or has been revoked", {
                cause: err
            });
        }
    }


    return decrypt(row.encryptedAccessToken);
}

module.exports = googleTokenRefresh;