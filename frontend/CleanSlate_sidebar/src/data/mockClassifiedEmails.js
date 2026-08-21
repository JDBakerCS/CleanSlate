

const educationalTemplates = [
  {
    senderName: "Udemy",
    senderEmail: "updates@udemy.com",
    subject: "Your course progress update",
    snippet:
      "Continue your course where you left off and review this week's materials.",
  },
  {
    senderName: "Coursera",
    senderEmail: "updates@coursera.org",
    subject: "New course recommendation",
    snippet:
      "Explore a course selected from your recent learning activity.",
  },
  {
    senderName: "Campus Learning Center",
    senderEmail: "learning@example.edu",
    subject: "Upcoming tutoring sessions",
    snippet:
      "Tutoring appointments are available for the upcoming week.",
  },
  {
    senderName: "edX",
    senderEmail: "courses@edx.org",
    subject: "Your weekly learning summary",
    snippet:
      "Review completed lessons and see which assignments are due next.",
  },
  {
    senderName: "Khan Academy",
    senderEmail: "progress@khanacademy.org",
    subject: "Your learning progress",
    snippet:
      "You completed another skill. Continue practicing to build mastery.",
  },
];

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const startingDate = new Date("2026-07-15T12:00:00.000Z");

const educationalEmails = Array.from(
  { length: 50 },
  (_, index) => {
    const template =
      educationalTemplates[index % educationalTemplates.length];

    const receivedAt = new Date(
      startingDate.getTime() - index * millisecondsPerDay
    ).toISOString();

    return {
      id: `educational-${index + 1}`,
      gmailMessageId: `mock-educational-${index + 1}`,
      threadId: `mock-thread-${index + 1}`,

      senderName: template.senderName,
      senderEmail: template.senderEmail,
      subject: template.subject,

      // Supplied by Gmail for human review, not sent to Gemini.
      snippet: template.snippet,

      receivedAt,
      category: "educational",
      recommendedAction: "review",
      confidence: "high",
      explanation:
        "The sender and subject indicate educational content.",
    };
  }
);

const mockClassifiedEmails = {
  educational: educationalEmails,
};

export function getMockEmailsByCategory(categoryId) {
  return mockClassifiedEmails[categoryId] ?? [];
}

export default mockClassifiedEmails;