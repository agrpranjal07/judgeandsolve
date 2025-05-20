"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SocialAuthButton from '@/components/SocialAuthButton';
import { useToast } from '@/hooks/use-toast';
import useFormValidation from '@/hooks/useFormValidation'; // Import useFormValidation
import api from '@/services/api';

const SignupPage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  });

  const initialFormData = {
    username: "",
    email: "",
    password: "",
  };

  const { formData, handleChange, handleSubmit, isLoading, validationErrors } = useFormValidation(
    initialFormData,
    signupSchema
  );

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      const response = await api.post('/auth/signup', data);

      toast({
        title: "Success!",
        description: response.data.message || "Signup successful!",
        variant: "default",
      });

      router.push('/auth/login');

    } catch (err: any) {
      if (err.response?.data?.message) {
        toast({
          title: "Error",
          description: err.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err.message || 'An unexpected error occurred. Please try again.',
          variant: "destructive",
        });
      }
    }
  };

  // Placeholder functions for social auth - replace with actual logic
  const handleGoogleSignIn = () => {
    const googleOAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
    if (googleOAuthUrl) {
      window.location.href = googleOAuthUrl;
    }
  };

  const handleGithubSignIn = async () => {
    const githubOAuthUrl = process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL;
    if (githubOAuthUrl) {
      window.location.href = githubOAuthUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <SocialAuthButton provider="github" onClick={handleGithubSignIn} disabled={isLoading} />
            <SocialAuthButton provider="google" onClick={handleGoogleSignIn} disabled={isLoading} />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
              {validationErrors?.find(error => error.path[0] === 'username') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.find(error => error.path[0] === 'username')?.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
               {validationErrors?.find(error => error.path[0] === 'email') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.find(error => error.path[0] === 'email')?.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
               {validationErrors?.find(error => error.path[0] === 'password') && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.find(error => error.path[0] === 'password')?.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground mt-2 w-full">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;
