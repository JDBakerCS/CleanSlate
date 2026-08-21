const heroMessages = {
  idle: {
    eyebrow: "AI-powered Gmail cleanup",
    title: "Declutter your inbox with confidence",
    description:
      "CleanSlate is a 3-part Chrome extension that scans your inbox, " +
      "classifies your emails into helpful, user-friendly folders, and " +
      "makes it simple to declutter a crowded inbox. After scanning, " +
      "CleanSlate lets you keep or archive emails by folder or individually. " +
      "It uses Google, Google Gemini, and human-written code to make your " +
      "life a little easier.",
  },

  scanning: {
    eyebrow: "Scanning safely",
    title: "Reviewing your cleanup candidates...",
    description:
      "Protected senders are skipped before classification, so their " +
      "emails remain untouched.",
  },

  completed: {
    eyebrow: "Scan complete",
    title: "Your recommendations are ready",
    description:
      "Review your scan summary before choosing which emails to keep " +
      "or archive.",
  },
};

function HeroIntro({ scanStatus = "idle" }) {
  const currentStatus = heroMessages[scanStatus] ? scanStatus : "idle";

  return (
    <header className="hero-stage">
      {Object.entries(heroMessages).map(([status, message]) => (
        <div
          key={status}
          className={`hero-intro ${
            currentStatus === status ? "hero-intro--active" : ""
          }`}
          aria-hidden={currentStatus !== status}
        >
          <p className="eyebrow">{message.eyebrow}</p>
          <h1 className="hero-title">{message.title}</h1>
          <p className="description">{message.description}</p>
        </div>
      ))}
    </header>
  );
}

export default HeroIntro;