const ai = require("../config/gemini");
const prompt = require("../schemas/GeminiEmailPrompt");
const classificationSchema = require("../schemas/GeminiOutput");

const geminiPrompting = async (labels, batch) => {

    const response = await ai.interactions.create({
        model: "gemini-3-flash-preview",

        input: JSON.stringify({
            existingLabels: labels,
            threads: batch
        }),

        system_instruction: prompt,

        response_format: {
            type: "text",
            mime_type: "application/json",
            schema: classificationSchema
        }
    })

    return JSON.parse(response.output_text);
}


module.exports = geminiPrompting;