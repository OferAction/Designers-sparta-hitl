import React, { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import LoginBackground from "@/assets/Login-background.svg";
import { Button } from "@/components/ui/button";
import { useValidateUserMutation } from "@/services/securityService";
import { useAuthStore } from "@/store/authStore";

// Module-level flag to prevent double invocation in React Strict Mode
let hasHandledAuthCallback = false;

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exchangeCodeForToken, isAuthenticated, checkAuthStatus } = useAuthStore();
  const { mutateAsync: validateUser } = useValidateUserMutation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Short-circuit if already handled (prevents Strict Mode double-run)
    if (hasHandledAuthCallback) {
      console.log("⏭ Callback already handled; skipping second invocation.");
      return;
    }
    hasHandledAuthCallback = true;

    const handleValidateUser = async () => {
      try {
        await validateUser();
        const redirectTo = sessionStorage.getItem("redirect_to") || "/";
        sessionStorage.removeItem("redirect_to");
        navigate(redirectTo, { replace: true });
      } catch (validationErr) {
        console.error("User validation failed", validationErr);
        throw new Error("User validation failed");
      }
    };

    const handleCallback = async () => {
      // Check if we've already processed this callback by looking for existing tokens
      if (isAuthenticated) {
        console.log("User already authenticated, navigating to home");
        // Perform server-side user validation AFTER token is set so headers include it
        await handleValidateUser();
        return;
      }

      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        console.log("Processing callback with parameters:", {
          code: code ? "present" : "missing",
          state,
          errorParam,
        });

        if (errorParam) {
          setError(`Authentication failed: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code || !state) {
          setError("Missing authorization code or state parameter");
          setLoading(false);
          return;
        }

        await exchangeCodeForToken(code, state);

        // Ensure auth store reflects new token state
        checkAuthStatus();

        // Perform server-side user validation AFTER token is set so headers include it
        await handleValidateUser();
      } catch (err) {
        console.error("Authentication callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, exchangeCodeForToken, isAuthenticated, checkAuthStatus, validateUser]);

  if (loading) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${LoginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-primary-foreground backdrop-blur-xl border rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-base font-semibold text-primary mb-2">Completing Sign In...</h2>
              <p className="text-muted-foreground">Please wait while we authenticate you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${LoginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-primary-foreground backdrop-blur-xl border rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">Authentication Failed</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/login")} className="w-22">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
