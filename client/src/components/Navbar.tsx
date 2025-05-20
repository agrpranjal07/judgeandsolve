'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import  useAuthStore  from '@/store/auth'; // Adjust path as needed
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button
// You might need to import DropdownMenu components from shadcn/ui
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const router = useRouter();
  const { accessToken, logout, user } = useAuthStore();

  const handleLogout = () => {
    logout(); // Clear Zustand state and optionally call the API
    router.push('/auth/login'); // Redirect to login page
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      {/* Logo and Product Name */}
      <div className="flex items-center">
        {/* Replace with your actual logo */}
        <div className="h-8 w-8 bg-blue-500 rounded-full mr-2"></div>
        <Link href="/" className="text-xl font-bold">
          JudgeAndSolve
        </Link>
      </div>

      {/* Navigation Links or Auth Buttons */}
      <div className="flex items-center space-x-4">
        {!accessToken ? (
          <>
            <Link href="/auth/login" passHref>
              <Button variant="ghost" className="text-white">Login</Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button variant="ghost" className="text-white">Sign Up</Button>
            </Link>
          </>
        ) : (
          <>
            {/* Profile Dropdown - Using a basic structure, replace with shadcn/ui DropdownMenu if available */}
            <div className="relative group">
              <Button variant="ghost" className="text-white">
                {/* Replace with profile icon/avatar */}
                Profile
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href="/me" passHref>
                  <div className="block px-4 py-2 hover:bg-gray-200 cursor-pointer">My Profile</div>
                </Link>
                <div
                  onClick={handleLogout}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  Logout
                </div>
              </div>
            </div>
            {/* If you have shadcn/ui dropdown, you can use this structure instead */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white">
                   Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/me')}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
