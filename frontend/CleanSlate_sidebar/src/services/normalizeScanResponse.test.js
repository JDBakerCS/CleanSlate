import test from "node:test";
import assert from "node:assert/strict";

import normalizeScanResponse from "./normalizeScanResponse.js";
import sampleBackendScanResponse from "../data/sampleBackendScanResponse.js";

test("normalizes the backend scan response", () => {
    const result = normalizeScanResponse(
        sampleBackendScanResponse
    );

    assert.equal(result.runId, 42);
    assert.equal(result.conversationCount, 2);
    assert.equal(result.emailCount, 3);
    assert.equal(result.categories.length, 2);

    const education = result.categories[0];
    const conversation = education.conversations[0];

    assert.equal(education.id, "education");
    assert.equal(education.conversationCount, 1);
    assert.equal(education.emailCount, 2);

    assert.equal(conversation.id, "thread-1");
    assert.equal(conversation.senderName, "Coursera");
    assert.equal(
        conversation.senderEmail,
        "updates@coursera.org"
    );
    assert.equal(conversation.messageCount, 2);
    assert.equal(
        conversation.subject,
        "Re: New course recommendation"
    );
});
test("returns an empty result for missing scan data", () => {
    const result = normalizeScanResponse();

    assert.deepEqual(result, {
        runId: null,
        conversationCount: 0,
        emailCount: 0,
        categories: [],
    });
});