const { google } = require("googleapis");
const { GoogleCredentials } = require("../models/index");
const pLimit = require("p-limit");
const googleTokenRefresh = require("./googleTokenRefresh");
const filterProtectedSenders = require("../utils/filterMessages");
require("dotenv").config();


// Do not forget that you still need auth middelware wherever you will use this
// since you still need the id to get from somewhere and that auth
// is doing it via given session cookie.

const allEmails = async (id) => {

    const limit = pLimit(5);

    const systemLabels = new Set([
        "INBOX", "UNREAD", "STARRED", "IMPORTANT",
        "SENT", "DRAFT", "SPAM", "TRASH", "CHAT", "CATEGORY_PERSONAL",
        "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_UPDATES",
        "CATEGORY_FORUMS"
    ]);

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


    /*
     const emailList = await gmail.users.messages.list({
        userId: "me",
        q: "in:inbox is:unread -is:starred -is:important  older_than:14d" 
    });
     
    */

    // to make sure map will not throw error, since user might now have 
    // matching emails after the query filter, so inbox will be treated
    // as an empty array for safety instead.


    /*
    const promises = (emailList.data.messages ?? []).map((message) => {
        return limit(() => {
            return gmail.users.messages.get({
                userId: "me",
                id: message.id
            })
        })
    });

    const allMessagesArr = await Promise.all(promises);     
     
    */


    const labelsData = await gmail.users.labels.list({
        userId: "me"
    });

    const labels = labelsData.data.labels;

    const formattedLabels = labels.filter((label) => {

        if (label.type === "user") {
            return {
                id: label.id,
                name: label.name,
                type: label.type
            }
        }
    });



    const allThreads = [];

    let pageToken;

    do {

        const result = await gmail.users.threads.list({
            userId: "me",
            q: "in:inbox is:unread older_than:14d", 
            maxResults: 100,
            pageToken
        });

        allThreads.push(...(result.data.threads ?? []));

        pageToken = result.data.nextPageToken;

    } while (pageToken);



    const threadPromises = (allThreads ?? []).map((thread) => {
        return limit(() => {
            return gmail.users.threads.get({
                userId: "me",
                id: thread.id,
                format: "metadata",
                metadataHeaders: ["From", "To", "Subject", "Date"]
            })
        })
    });

    const threads = await Promise.all(threadPromises);



    /*
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
        }
    });
     
    */


    const formattedThreads = threads.map((response) => {
        const thread = response.data;

        return {
            threadId: thread.id,

            messages: thread.messages.map((message) => {
                const headers = message.payload?.headers ?? [];

                const getHeader = (name) => {
                    return headers.find(
                        (header) =>
                            header.name.toLowerCase() === name.toLowerCase()
                    )?.value ?? null;
                };

                return {
                    id: message.id,
                    threadId: message.threadId,

                    from: getHeader("From"),
                    to: getHeader("To"),
                    subject: getHeader("Subject"),
                    date: getHeader("Date"),

                    snippet: message.snippet,
                    labels: message.labelIds ?? []
                };
            })
        };
    });



    /*
       
    const filteredByLabel = formattedMessages.filter(({ labels }) => {
        return !labels.some((label) => {
            return !systemLabels.has(label);
        })
    });


    const finalizedEmails = await filterProtectedSenders(filteredByLabel, id);

    return {
        messages: finalizedEmails,
        totalMessages: finalizedEmails.length
    };
     
    */


    const finalResultBeforeFilter = await filterProtectedSenders(formattedThreads, id, matchingCredentials);

    const finalResult = finalResultBeforeFilter.filter((thread) => {

        return thread.messages.every(({ labels }) => {

            return labels.every((label) => {
                return (
                    (label !== "IMPORTANT" && label !== "STARRED") && systemLabels.has(label)
                )
            })
        })
    });


    // Leaves less data specifically for the Gemini, and token usage.
    const forGemini = finalResult.map((thread) => {

        return {
            threadId: thread.threadId,

            messages: thread.messages.map((message) => {

                return {
                    from: message.from,
                    to: message.to,
                    subject: message.subject,
                    date: message.date,
                    snippet: message.snippet
                }
            })
        }
    })

    return {
        threads: finalResult,
        totalConversations: finalResult.length,
        forGemini: forGemini,
        labels: formattedLabels
    }
}


module.exports = allEmails;