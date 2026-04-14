import React from "react";

import { Navigate, useLocation } from "react-router-dom";

import LoginBackground from "@/assets/Login-background.svg";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const LoginPage: React.FC = () => {
  const { signIn, loading, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const handleSignIn = async () => {
    if (!loading) {
      if (sessionStorage.getItem("redirect_to") === null) {
        sessionStorage.setItem("redirect_to", location.state?.from?.pathname || "/");
      }
      await signIn();
    }
  };

  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? "/"} replace />;
  }

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
        <div className="bg-primary-foreground backdrop-blur-xl border  rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-12">Login to your account</h1>
          </div>

          <div className="space-y-10 flex flex-col items-center">
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="text-sm w-80 min-w-20 h-10 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 0H11.4046V11.4046H0V0Z" fill="#F25022" />
                    <path d="M12.5957 0H24.0004V11.4046H12.5957V0Z" fill="#7FBA00" />
                    <path d="M0 12.5953H11.4046V23.9999H0V12.5953Z" fill="#00A4EF" />
                    <path d="M12.5957 12.5952H24.0004V23.9999H12.5957V12.5952Z" fill="#FFB900" />
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground space-x-6">
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
