const sampleBackendScanResponse = {
    runId: 42,

    categories: [
        {
            labelName: "Education",
            action: "CREATE_NEW",
            existingLabelId: null,
            explanation:
                "Course updates and educational resources.",
            status: "pending",

            threadIds: [
                {
                    threadId: "thread-1",
                    confidenceScore: 0.94,

                    messages: [
                        {
                            id: "message-1",
                            from:
                                "Coursera <updates@coursera.org>",
                            to: "student@example.com",
                            subject:
                                "New course recommendation",
                            date:
                                "2026-08-16T12:00:00Z",
                            snippet:
                                "Explore these recommended courses.",
                        },
                        {
                            id: "message-2",
                            from:
                                "Coursera <updates@coursera.org>",
                            to: "student@example.com",
                            subject:
                                "Re: New course recommendation",
                            date:
                                "2026-08-17T12:00:00Z",
                            snippet:
                                "Here are more course details.",
                        },
                    ],
                },
            ],
        },

        {
            labelName: "Promotions",
            action: "CREATE_NEW",
            existingLabelId: null,
            explanation:
                "Sales and recurring promotional messages.",
            status: "pending",

            threadIds: [
                {
                    threadId: "thread-2",
                    confidenceScore: 0.88,

                    messages: [
                        {
                            id: "message-3",
                            from:
                                "Example Store <sales@example-store.com>",
                            to: "student@example.com",
                            subject: "Weekend sale",
                            date:
                                "2026-08-17T15:00:00Z",
                            snippet:
                                "Save 20 percent this weekend.",
                        },
                    ],
                },
            ],
        },
    ],
};

export default sampleBackendScanResponse;