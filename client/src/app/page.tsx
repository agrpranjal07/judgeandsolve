"use client";

import { useAuth } from "@/_hooks/useAuth";
import { useAuthContext } from "@/_components/AuthProvider";
import LandingPage from "@/_components/LandingPage";
import Dashboard from "@/_components/Dashboard";
import AuthLoader from "@/_components/AuthLoader";

export default function HomePage() {
  const { accessToken, user } = useAuth();
  const { isInitialized, isLoading } = useAuthContext();

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return <AuthLoader />;
  }

  // Show dashboard if authenticated, landing page if not
  return accessToken && user ? <Dashboard /> : <LandingPage />;
}
