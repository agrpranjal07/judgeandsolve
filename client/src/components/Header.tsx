"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Code } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";
import api from "@/services/api";
import useAuthStore from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


export function Header() {
  const router = useRouter();
  
  const { accessToken, user, logout } = useAuth();

  useEffect(() => {
    console.log("Refreshing...")
    router.refresh();
  }, [accessToken,user,logout]);
  
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await api.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        if (response.data?.accessToken) {
          useAuthStore.getState().setAccessToken(response.data.accessToken);
        }
      } catch (error) {
        console.error('Failed to refresh access token:', error);
      }
    };

    refreshAccessToken();
  }, []);


  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-violet-600 p-1">
            <Code className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">JudgeAndSolve</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/problems" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Problems
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Leaderboard
          </Link>
          <Link href="/contests" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Contests
          </Link>
          <Link href="/discuss" className="text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Discuss
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        { !accessToken ?
          <div className="flex items-center gap-4">
            <Button 
                variant="outline" 
                className="border-violet-600/50 text-violet-600 dark:border-violet-500/30 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                onClick={() => router.push('/auth/login')}
            >
                Log In
            </Button>
            <Button 
                className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white hidden sm:block"
                onClick={() => router.push('/auth/signup')}
            >
                Sign Up
            </Button>
          </div> : 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                aria-label="Open user menu"
              >
                {user?.username ? user.username[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : <User className="w-5 h-5" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username || user?.email || "User"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/me" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          }
        </div>
      </div>
    </header>
  );
}
