import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import StoreList from "@/components/StoreList";
import AuthPanel from "@/components/AuthPanel";
import Dashboard from "@/components/Dashboard";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const { user, login, logout } = useAuth();
  const [healthy, setHealthy] = useState(false);

  useEffect(() => {
    api.get("/").then(() => setHealthy(true)).catch(() => setHealthy(false));
  }, []);

  const content = useMemo(() => {
    if (!healthy) {
      return <div className="p-6">Connecting to API…</div>;
    }
    if (!user) {
      return (
        <>
          <Hero />
          <div className="max-w-4xl mx-auto p-4">
            <AuthPanel onLogin={login} />
            <StoreList />
          </div>
        </>
      );
    }
    return <Dashboard user={user} onLogout={logout} />;
  }, [healthy, user, login, logout]);

  return <Layout>{content}</Layout>;
}