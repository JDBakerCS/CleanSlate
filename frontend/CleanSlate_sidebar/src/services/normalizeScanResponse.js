// Backend categories
//     -> classified threads
//         -> nested messages

// Normalized frontend categories
//     -> conversation rows
//        -> latest-message preview

// Translates nested backend response into data that the
// frontend summary and conversation components can use.


function createCategoryId(labelName) {
    return String(labelName || "uncategorized")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseSender(fromValue) {
    if (typeof fromValue !== "string") {
        return {
            senderName: "Unknown sender",
            senderEmail: "",
        };
    }

    const from = fromValue.trim();
    const senderMatch =
        from.match(/^(.*?)\s*<([^>]+)>$/);

    if (senderMatch) {
        const senderName = senderMatch[1].trim();
        const senderEmail =
            senderMatch[2].trim().toLowerCase();

        return {
            senderName: senderName || senderEmail,
            senderEmail,
        };
    }

    return {
        senderName: from || "Unknown sender",
        senderEmail: from.includes("@")
            ? from.toLowerCase()
            : "",
    };
}

function normalizeConversation(thread) {
    const messages = Array.isArray(thread?.messages)
        ? thread.messages
        : [];

    const latestMessage =
        messages[messages.length - 1] ?? {};

    const { senderName, senderEmail } =
        parseSender(latestMessage.from);

    return {
        id: thread?.threadId ?? "",
        threadId: thread?.threadId ?? "",

        senderName,
        senderEmail,

        subject: latestMessage.subject || "(No subject)",
        receivedAt: latestMessage.date ?? null,
        snippet: latestMessage.snippet || "",

        messageCount: messages.length,
        messages,
        confidenceScore:
            thread?.confidenceScore ?? null,
    };
}

function normalizeScanResponse(response) {
    const backendCategories =
        Array.isArray(response?.categories)
            ? response.categories
            : [];

    const normalizedCategories =
        backendCategories.map((category) => {
            const backendThreads =
                Array.isArray(category?.threadIds)
                    ? category.threadIds
                    : [];

            const conversations =
                backendThreads.map(
                    normalizeConversation
                );

            // Count emails in this category.
            let emailCount = 0;

            for (const conversation of conversations) {
                emailCount +=
                    conversation.messageCount;
            }

            const label =
                category?.labelName || "Uncategorized";

            return {
                id: createCategoryId(label),
                label,
                description:
                    category?.explanation || "",

                action: category?.action ?? null,
                existingLabelId:
                    category?.existingLabelId ?? null,
                status:
                    category?.status ?? "pending",

                conversationCount:
                    conversations.length,
                emailCount,
                conversations,
            };
        });

    // Calculate totals across every category.
    let totalConversationCount = 0;
    let totalEmailCount = 0;

    for (const category of normalizedCategories) {
        totalConversationCount +=
            category.conversationCount;

        totalEmailCount += category.emailCount;
    }

    return {
        runId: response?.runId ?? null,
        conversationCount: totalConversationCount,
        emailCount: totalEmailCount,
        categories: normalizedCategories,
    };
}

export default normalizeScanResponse;