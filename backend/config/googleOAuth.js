const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, // This is basically our app’s public identifier.

    process.env.GOOGLE_CLIENT_SECRET, // It helps prove to Google that the request is really coming 
    // from our backend and not just someone pretending to be our app.

    process.env.GOOGLE_REDIRECT_URI // This is the URL Google sends the user back to after they approve or deny access.
)

module.exports = oauth2Client;









// OAuth2 is the class provided by the google
// and following line new google.auth.OAuth2(...)
// simply creates the instance of that OAuth2 class
// specifically configured for Our app with those specific
// enviromnetal variables retrieved from google that were
// created for our specific project in the google cloud


