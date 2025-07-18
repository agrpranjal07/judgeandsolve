'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/_services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/_components/ui/card';
import { Separator } from '@/_components/ui/separator';
import { format } from 'date-fns';

interface UserProfile {
  username: string;
  joinedDate: string;
}

const UserProfilePage = () => {
  const params = useParams();
  const username = params.username as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/profile/${username}`);
        setUserProfile(response.data.data);
        setLoading(false);
      } catch (err: unknown) {
        setError((err as { response?: { data?: { message: string } } })?.response?.data?.message || 'Failed to fetch user profile.');
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!userProfile) {
    return <div className="flex justify-center items-center h-screen">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{userProfile.username}&apos;s Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg">{userProfile.username}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500">Joined Date</p>
              <p className="text-lg">{format(new Date(userProfile.joinedDate), 'PP')}</p>
            </div>
            {/* Add more public profile information here as needed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;