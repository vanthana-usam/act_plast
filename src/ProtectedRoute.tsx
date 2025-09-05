// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth();
  // console.log("ProtectedRoute: User:", user); // Debug

  if (!user) {
    // console.log("ProtectedRoute: No user, redirecting to /"); // Debug
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;