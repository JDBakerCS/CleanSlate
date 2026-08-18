const { ProtectedSender } = require("../models/index");

const filterProtectedSenders = async (messages, id, credentials) => {

    const protectedSenderRegex = /<([^>]+)>/;

    const matchedSenders = await ProtectedSender.findAll({
        where: {
            userId: id
        },

        attributes: {
            exclude: [
                "id",
                "userId",
                "displayName"
            ]
        }
    });

    const matchedSendersArr = [];

    matchedSenders.forEach(({ senderEmail }) => {
        matchedSendersArr.push(senderEmail);
    });


    // kind of still trusting that gmail will always have email inside the from section
    // So it is either a plain email or the seperated headers, well structured ones
    // and that is the reason I am using the regex to get only the email.


    /*
    const emailsResult = messages.filter(({ from }) => {
        const retrievedEmail = (from.match(protectedSenderRegex)?.[1] ?? from).trim().toLowerCase();

        return !matchedSendersArr.includes(retrievedEmail);
    })

    return emailsResult;
     
    */



    const removedProtected = messages.filter((subMessage) => {

        const fromArr = subMessage.messages.reduce((acc, { from }) => {
            const retrievedEmail = (from.match(protectedSenderRegex)?.[1] ?? from).trim().toLowerCase();

            if (retrievedEmail !== credentials.googleEmail) acc.push(retrievedEmail);

            return acc;

        }, []);

        return fromArr.every((email) => {
            return !matchedSendersArr.includes((email));
        })
    });

    return removedProtected;
}

module.exports = filterProtectedSenders;