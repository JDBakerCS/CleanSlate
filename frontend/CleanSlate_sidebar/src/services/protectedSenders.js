import authenticatedFetch from "./authenticatedFetch";

const apiUrl = import.meta.env.VITE_API_URL;

function requireApiUrl() {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }
}

async function getErrorMessage(response, fallbackMessage) {
  const errorBody = await response.json().catch(() => null);
  return errorBody?.message || fallbackMessage;
}

async function getProtectedSenders() {
  requireApiUrl();

  const response = await authenticatedFetch(`${apiUrl}/api/protected`);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Loading protected senders failed with status ${response.status}.`
    );
    throw new Error(errorMessage);
  }

  return response.json();
}

async function addProtectedSender(displayName, senderEmail) {
  requireApiUrl();

  const response = await authenticatedFetch(`${apiUrl}/api/protected`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: displayName.trim() || undefined,
      senderEmail: senderEmail.trim(),
    }),
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Adding protected sender failed with status ${response.status}.`
    );
    throw new Error(errorMessage);
  }

  return response.json();
}

async function removeProtectedSender(id) {
  requireApiUrl();

  const response = await authenticatedFetch(
    `${apiUrl}/api/protected/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Removing protected sender failed with status ${response.status}.`
    );
    throw new Error(errorMessage);
  }
}

export {
  getProtectedSenders,
  addProtectedSender,
  removeProtectedSender,
};
