"use client";

import { Button } from "@/_components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Code, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/_hooks/useAuth";

export function Header() {
  const router = useRouter();
  const { accessToken, user, logout } = useAuth();

  const handleLoginClick = () => {
    // Store current path for redirect after login if it's not already an auth page
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/auth/')) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      // Use URL parameter for better reliability
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-violet-600 p-1">
            <Code className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">JudgeAndSolve</span>
        </Link>

        {/* Main nav */}
        <nav className="hidden md:flex items-center gap-6">
          {["problems", "leaderboard"].map((path) => (
            <Link
              key={path}
              href={path === "leaderboard" ? "/stats/leaderboard" : `/${path}`}
              className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {accessToken && user ? (
            <div className="flex items-center gap-4">
              <Button
                className="hidden sm:inline-flex bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Link
                href="/me"
                className="flex items-center justify-center h-10 w-10 bg-violet-600 dark:bg-violet-700 rounded-full"
                aria-label="Your profile"
              >
                <User className="h-5 w-5 text-white" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-violet-600/50 text-violet-600 dark:border-violet-500/30 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                onClick={handleLoginClick}
              >
                Log In
              </Button>
              <Button
                className="hidden sm:inline-flex bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
