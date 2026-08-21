import authenticatedFetch from "./authenticatedFetch";

const apiUrl = import.meta.env.VITE_API_URL;

async function acceptCategory(runId, labelName) {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await authenticatedFetch(
    `${apiUrl}/api/gmail/categories/${runId}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        labelName,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Accept category failed with status ${response.status}.`
    );
  }

  return response.json();
}
async function trashCategory(runId, labelName) {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await authenticatedFetch(
    `${apiUrl}/api/gmail/categories/${runId}/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        labelName,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Trash category failed with status ${response.status}.`
    );
  }
}

// Sends the selected conversation IDs to one of the backend detail routes.
async function updateSelectedConversations(
  runId,
  labelName,
  conversationIds,
  action,
  method
) {
  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await authenticatedFetch(
    `${apiUrl}/api/gmail/categories/${runId}/details/${action}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        labelName,
        threads: conversationIds,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `${action} selected conversations failed with status ${response.status}.`
    );
  }

  return response.json();
}

function acceptSelectedConversations(runId, labelName, conversationIds) {
  return updateSelectedConversations(
    runId,
    labelName,
    conversationIds,
    "accept",
    "POST"
  );
}

function keepSelectedConversations(runId, labelName, conversationIds) {
  return updateSelectedConversations(
    runId,
    labelName,
    conversationIds,
    "decline",
    "POST"
  );
}

function trashSelectedConversations(runId, labelName, conversationIds) {
  return updateSelectedConversations(
    runId,
    labelName,
    conversationIds,
    "delete",
    "DELETE"
  );
}


export { 
    acceptCategory,
    trashCategory,
    acceptSelectedConversations,
    keepSelectedConversations,
    trashSelectedConversations,
 };
