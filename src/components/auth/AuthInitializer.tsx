import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Initialize auth status check on app start
    checkAuthStatus();
  }, [checkAuthStatus]);

  return <>{children}</>;
};
