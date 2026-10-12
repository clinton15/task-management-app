import { useEffect, useState } from "react";
import { api } from "./api/api";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import type { AuthUser, MeResponse } from "./types/user";
import "./App.css";

async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data.user;
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const currentUser = await fetchCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLoginSuccess() {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }

  if (checkingSession) {
    return <p>Checking session...</p>;
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => void handleLoginSuccess()} />;
  }

  return <Dashboard user={user} onLogout={() => void handleLogout()} />;
}

export default App;
