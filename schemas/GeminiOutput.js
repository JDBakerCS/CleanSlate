const classificationSchema = {
    type: "object",

    properties: {

        categories: {
            type: "array",

            items: {
                type: "object",

                properties: {

                    labelName: {
                        type: "string"
                    },

                    action: {
                        type: "string",
                        enum: ["USE_EXISTING", "CREATE_NEW"]
                    },

                    existingLabelId: {
                        type: ["string", "null"]
                    },

                    explanation: {
                        type: "string"
                    },

                    threadIds: {
                        type: "array",

                        items: {
                            type: "object",

                            properties: {

                                threadId: {
                                    type: "string"
                                },

                                confidenceScore: {
                                    type: "number",

                                    minimum: 0,
                                    maximum: 1
                                }
                            },

                            required: [
                                "threadId",
                                "confidenceScore"
                            ]
                        }
                    }
                },

                required: [
                    "labelName",
                    "action",
                    "existingLabelId",
                    "explanation",
                    "threadIds"
                ]
            }
        }
    },

    required: ["categories"]
}

module.exports = classificationSchema;

// required goes on the same level as the properties.