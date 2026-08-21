import { useEffect, useState } from "react";
import ScanFlow from "./components/ScanFlow";
import Navbar from "./components/Navbar"
import HeroIntro from "./components/HeroIntro";
import ProtectedSendersPage from "./components/ProtectedSendersPage";

const apiUrl = import.meta.env.VITE_API_URL;
const loginUrl = `${apiUrl}/api/auth/google`;

//opens Google login in a separate tab so the side panel itself stays open
function handleClick() {
  chrome.tabs.create({ url: loginUrl });
}




function App() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activePage, setActivePage] = useState("scanner");


  async function handleLogout() {
    try {
      const { sessionToken } = await chrome.storage.local.get("sessionToken");

      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      await chrome.storage.local.remove("sessionToken");
      setActivePage("scanner");
      setUser(null);
    } catch (error) {
      console.error("Could not log out:", error);
    }
  }
  async function checkAuth() {
    try {
      const { sessionToken } = await chrome.storage.local.get("sessionToken");

      if (!sessionToken) {
        return;
      }

      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        // stored token is dead - the backend can't clear it for us, so we do it here
        await chrome.storage.local.remove("sessionToken");
      }
    } catch (error) {
      console.error("could not check authentication:", error);
    } finally {
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    // Auth state is updated after asynchronous extension storage and API checks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    }

    function handleMessage(message) {
      if (message.type === "CLEANSLATE_AUTH_UPDATED") {
        checkAuth();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);


  if (isCheckingAuth) {
    return <p>Checking connection...</p>
  }
  if (!user) {
    return (
      <div className="app-shell">
        <Navbar isAuthenticated={false} />

        <main className="main-content">
          <HeroIntro />

          <button
            type="button"
            className="login-btn"
            onClick={handleClick}
          >
            Login with Google
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        isAuthenticated={true}
        onProtectedSendersClick={() => setActivePage("protected-senders")}
      />

      <main className="main-content">
        {activePage === "protected-senders" ? (
          <ProtectedSendersPage onBack={() => setActivePage("scanner")} />
        ) : (
          <ScanFlow />
        )}

        <div className="account-actions">
          <p className="account-status">
            Signed in to {user.email}
          </p>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
