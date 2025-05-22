"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import api from '@/_services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/_components/ui/card';
import { Input } from '@/_components/ui/input';
import { Button } from '@/_components/ui/button';
import { Label } from '@/_components/ui/label';
import { Separator } from "@/_components/ui/separator";
import SocialAuthButton from '@/_components/SocialAuthButton';
import { useToast } from '@/_hooks/use-toast';
import useFormValidation from '@/_hooks/useFormValidation';
import { useAuth } from '@/_hooks/useAuth';

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();

  const { setAccessToken, setUser } = useAuth();

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  });

  const initialFormData = {
    email: '',
    password: '',
  };

  const {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    validationErrors,
  } = useFormValidation(initialFormData, loginSchema);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const loginResponse = await api.post('/auth/login', data);
      const { accessToken } = loginResponse.data.data;
      setAccessToken(accessToken);

      const { data:{data: userProfile} } = await api.get('/auth/me');
      console.log(userProfile);
      setUser(userProfile);

      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        variant: 'default',
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description:
          error.response?.data?.message || error.message || 'An error occurred during login.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignIn = async () => {
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
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in
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
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground mt-2 w-full">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
