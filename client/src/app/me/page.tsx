"use client";

import { useEffect, useState } from "react";
import  useAuthStore  from "@/store/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserData {
  username: string;
  email: string;
  role: string;
}

const MePage = () => {
  useAuthGuard();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get<UserData>("/api/v1/auth/me");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data.");
        setUser(null); // Clear user if fetch fails
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user data is not already in the store
    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, setUser]);

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading user data...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>;
  }

  if (!user) {
    // This case should ideally not happen if useAuthGuard works,
    // but as a fallback
    return <div className="container mx-auto py-8 text-center">User data not available.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-semibold">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MePage;