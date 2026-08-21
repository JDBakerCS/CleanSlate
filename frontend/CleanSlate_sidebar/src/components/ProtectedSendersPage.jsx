import { useEffect, useState } from "react";
import {
  addProtectedSender,
  getProtectedSenders,
  removeProtectedSender,
} from "../services/protectedSenders";
import "../styles/ProtectedSenders.css";

function ProtectedSendersPage({ onBack }) {
  const [senders, setSenders] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingSenderId, setRemovingSenderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentPage = true;

    async function loadProtectedSenders() {
      try {
        const protectedSenders = await getProtectedSenders();

        if (isCurrentPage) {
          setSenders(protectedSenders);
        }
      } catch (error) {
        if (isCurrentPage) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isCurrentPage) {
          setIsLoading(false);
        }
      }
    }

    loadProtectedSenders();

    return () => {
      isCurrentPage = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const newSender = await addProtectedSender(displayName, senderEmail);
      setSenders((currentSenders) => [...currentSenders, newSender]);
      setDisplayName("");
      setSenderEmail("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(senderId) {
    setRemovingSenderId(senderId);
    setErrorMessage("");

    try {
      await removeProtectedSender(senderId);
      setSenders((currentSenders) =>
        currentSenders.filter((sender) => sender.id !== senderId)
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setRemovingSenderId(null);
    }
  }

  return (
    <section className="protected-senders" aria-labelledby="protected-title">
      <button type="button" className="protected-back-btn" onClick={onBack}>
        &larr; Back to scanner
      </button>

      <header className="protected-senders__header">
        <p className="eyebrow">Protected senders</p>
        <h1 id="protected-title">Keep important senders safe</h1>
        <p>
          CleanSlate skips protected senders before classification, leaving
          their conversations untouched.
        </p>
      </header>

      <form className="protected-form" onSubmit={handleSubmit}>
        <label htmlFor="protected-name">Name (optional)</label>
        <input
          id="protected-name"
          type="text"
          maxLength="255"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Example: School registrar"
        />

        <label htmlFor="protected-email">Sender email</label>
        <input
          id="protected-email"
          type="email"
          required
          value={senderEmail}
          onChange={(event) => setSenderEmail(event.target.value)}
          placeholder="sender@example.com"
        />

        <button type="submit" className="protected-add-btn" disabled={isSaving}>
          {isSaving ? "Adding sender..." : "Add protected sender"}
        </button>
      </form>

      {errorMessage && (
        <p className="protected-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="protected-list-heading">
        <h2>Your protected senders</h2>
        {!isLoading && <span>{senders.length}</span>}
      </div>

      {isLoading ? (
        <p className="protected-list-message" role="status">
          Loading protected senders...
        </p>
      ) : senders.length === 0 ? (
        <p className="protected-list-message">
          No protected senders yet. Add one above to keep their conversations
          out of future scans.
        </p>
      ) : (
        <ul className="protected-list">
          {senders.map((sender) => (
            <li key={sender.id} className="protected-list__item">
              <div>
                <strong>{sender.displayName || "Protected sender"}</strong>
                <span>{sender.senderEmail}</span>
              </div>

              <button
                type="button"
                className="protected-remove-btn"
                disabled={removingSenderId === sender.id}
                onClick={() => handleRemove(sender.id)}
              >
                {removingSenderId === sender.id ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ProtectedSendersPage;
