"use client";

import { useEffect } from "react";
import useAuthStore from "@/_store/auth";
import api from "@/_services/api";
import LandingPage from "@/_components/LandingPage";
import Dashboard from "@/_components/Dashboard";

export default function HomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user, setUser } = useAuthStore();

  // Fetch user data if we have a token but no user
  useEffect(() => {
    if (!accessToken || user) return;
    
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    
    fetchUser();
  }, [accessToken, user, setUser]);

  // Show dashboard if authenticated, landing page if not
  return accessToken && user ? <Dashboard /> : <LandingPage />;
}
