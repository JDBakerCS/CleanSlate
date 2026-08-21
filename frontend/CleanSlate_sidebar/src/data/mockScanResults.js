// Temporary frontend data used until scan results come from the backend.
// Emails from protected senders are excluded from these totals.

const mockScanResults = {
  scanId: "mock-scan-1",
  status: "ready_for_review",
  fetchedCount: 280,
  protectedCount: 13,
  analyzedCount: 267,

  categories: [
    {
      id: "educational",
      label: "Educational",
      count: 50,
      description:
        "Course updates, lecture notes, and campus announcements.",
    },
    {
      id: "promotions",
      label: "Promotions",
      count: 94,
      description:
        "Sales, discount codes, and recurring promotional emails.",
    },
    {
      id: "newsletters",
      label: "Newsletters",
      count: 63,
      description:
        "Recurring digests and updates from publications.",
    },
    {
      id: "social",
      label: "Social",
      count: 35,
      description:
        "Notifications, mentions, and updates from social platforms.",
    },
    {
      id: "low-priority",
      label: "Low priority",
      count: 25,
      description:
        "Messages from senders you rarely interact with.",
    },
  ],
};

export default mockScanResults;