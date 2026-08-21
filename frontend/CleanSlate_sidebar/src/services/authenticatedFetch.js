// Adds the extension's stored session token to authenticated API requests.
async function authenticatedFetch(url, options = {}) {
  const { sessionToken } = await chrome.storage.local.get("sessionToken");

  if (!sessionToken) {
    throw new Error("No extension session token is available.");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${sessionToken}`,
    },
  });
}

export default authenticatedFetch;
