"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { AuthOverlay } from "./AuthOverlay";

export const AuthWrapper = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div
      className={cn(
        "relative bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden w-[900px] max-w-full min-h-[580px]",
        isSignUp ? "right-panel-active" : ""
      )}
    >

      <div
        className={cn(
          "absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out opacity-0 z-10",
          isSignUp && "translate-x-full opacity-100 z-40"
        )}
      >
        <RegisterForm className="bg-white flex flex-col items-center justify-center h-full px-12 text-center" />
      </div>

      <div
        className={cn(
          "absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out z-20",
          isSignUp && "translate-x-full opacity-0"
        )}
      >
        <LoginForm className="bg-white flex flex-col items-center justify-center h-full px-12 text-center" />
      </div>

      <AuthOverlay isSignUp={isSignUp} onShowLogin={() => setIsSignUp(false)} onShowRegister={() => setIsSignUp(true)} />
    </div>
  );
};
