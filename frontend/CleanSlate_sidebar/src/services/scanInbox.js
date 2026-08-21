import normalizeScanResponse from "./normalizeScanResponse";

const apiUrl = import.meta.env.VITE_API_URL;

async function scanInbox() {
    if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
    }

    const { sessionToken } = await chrome.storage.local.get("sessionToken");

    const response = await fetch(`${apiUrl}/api/gmail`, {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionToken}` },
    });

    if (!response.ok) {
        throw new Error(
            `Inbox scan failed with status ${response.status}.`
        );
    }

    const backendScanResponse = await response.json();

    if(!Array.isArray(backendScanResponse?.categories)) {
        throw new Error(
            "The backend returned an unexpected scan response."
        );
    }

    return normalizeScanResponse(backendScanResponse);
}

export default scanInbox;