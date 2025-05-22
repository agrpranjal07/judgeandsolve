import React from "react";
import { Button } from "@/_components/ui/button";
import { cn } from "@/_lib/utils";
import { Github } from "lucide-react";

type SocialAuthButtonProps = {
  provider: "google" | "github";
  onClick: () => void;
  className?: string;
  disabled?: boolean; // Added disabled prop
};

const SocialAuthButton = ({
  provider,
  onClick,
  className,
  disabled, // Added disabled prop
}: SocialAuthButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "flex items-center gap-2 w-full", // Removed specific border and hover classes to rely on shadcn defaults
        className
      )}
      onClick={onClick}
      disabled={disabled} // Pass disabled prop to Button
    >
      {provider === "github" ? (
        <Github size={18} />
      ) : (
        // Custom Google SVG icon since it's not available in lucide-react
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          <path d="M15.5 8.5L19 12l-3.5 3.5M8.5 12h10.5" />
        </svg>
      )}
      <span>Continue with {provider === "github" ? "GitHub" : "Google"}</span>
    </Button>
  );
};

export default SocialAuthButton;