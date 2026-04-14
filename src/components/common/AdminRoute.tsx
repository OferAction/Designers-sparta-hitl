import React from "react";

import { Navigate } from "react-router-dom";


const AdminRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const canAccessAdmin = true;

  if (!canAccessAdmin) {
    return <Navigate to="/settings"  replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
