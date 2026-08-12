const { google } = require("googleapis");
const { GoogleCredentials } = require("../models/index");
const pLimit = require("p-limit");
const googleTokenRefresh = require("./googleTokenRefresh");
const filterProtectedSenders = require("./filterMessages");
require("dotenv").config();


// Do not forget that you still need auth middelware wherever you will use this
// since you still need the id to get from somewhere and that auth
// is doing it via given session cookie.

const allEmails = async (id) => {

    const limit = pLimit(10);

    const systemLabels = [
        "INBOX", "UNREAD", "STARRED", "IMPORTANT",
        "SENT", "DRAFT", "SPAM", "TRASH", "CHAT", "CATEGORY_PERSONAL",
        "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_UPDATES",
        "CATEGORY_FORUMS"
    ]

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const matchingCredentials = await GoogleCredentials.findOne({
        where: {
            userId: id
        }
    });

    const rawAccessToken = await googleTokenRefresh(matchingCredentials);

    oauth2Client.setCredentials({
        access_token: rawAccessToken
    });


    const gmail = google.gmail({
        version: "v1",
        auth: oauth2Client
    });


    const emailList = await gmail.users.messages.list({
        userId: "me",
        q: "in:inbox is:unread -is:starred -is:important older_than:14d"
    });


    // to make sure map will not throw error, since user might now have 
    // matching emails after the query filter, so inbox will be treated
    // as an empty array for safety instead.
    const promises = (emailList.data.messages ?? []).map((message) => {
        return limit(() => {
            return gmail.users.messages.get({
                userId: "me",
                id: message.id
            })
        })
    });

    const allMessagesArr = await Promise.all(promises);

    const formattedMessages = allMessagesArr.map((singleMessage) => {
        const message = singleMessage.data;

        const headers = message.payload.headers ?? [];
        const labels = message.labelIds ?? [];

        const from = headers.find(
            header => header.name === "From"
        )?.value ?? null;

        const subject = headers.find(
            header => header.name === "Subject"
        )?.value ?? null;

        const date = headers.find(
            header => header.name === "Date"
        )?.value ?? null;


        // This is an object and body lives inside.
        const plainTxt = message.payload.parts?.find(
            part => part.mimeType === "text/plain"
        );

        let body = null;

        if (plainTxt?.body?.data) {
            body = Buffer.from(
                plainTxt.body.data,
                "base64url"
            ).toString("utf-8");
        }

        return {
            id: message.id,
            threadId: message.threadId,

            from,
            subject,
            date,

            snippet: message.snippet,

            labels,

            body
        }
    });


    const filteredByLabel = formattedMessages.filter(({ labels }) => {
        return !labels.some((label) => {
            return !systemLabels.includes(label);
        })
    });


    const finalizedEmails = await filterProtectedSenders(filteredByLabel, id);

    return {
        messages: finalizedEmails,
        totalMessages: finalizedEmails.length
    };
}