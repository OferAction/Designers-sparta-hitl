import React, { useEffect } from "react";

import { Navigate, useLocation } from "react-router-dom";

import LoginBackground from "@/assets/Login-background.svg";
import { useTheme } from "@/contexts";
import { useGetUserProfile } from "@/services/securityService";
import { useAuthStore } from "@/store/authStore";

const THEMES = ["system", "light", "dark"] as const;

const AuthorizedAccess: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data, isSuccess } = useGetUserProfile();
  const { setColorMode } = useTheme();
  useEffect(() => {
    if (isSuccess && data) {
      const userPreferredTheme = data?.theme && data.theme in THEMES ? THEMES[data.theme] : undefined;
      if (userPreferredTheme) {
        setColorMode(userPreferredTheme);
      }
    }
  }, [data, isSuccess, setColorMode]);

  return <>{children}</>;
};

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${LoginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center">
          <div className="bg-primary-foreground backdrop-blur-xl border rounded-3xl shadow-2xl p-8 max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-primary mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AuthorizedAccess>{children}</AuthorizedAccess>;
};

export default ProtectedRoute;
