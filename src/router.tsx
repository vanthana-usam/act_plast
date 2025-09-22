// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <AuthProvider>
          <Login />
        </AuthProvider>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <AuthProvider>
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        </AuthProvider>
      ),
    },
    {
      path: "*",
      element: (
        <AuthProvider>
          <NotFound />
        </AuthProvider>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,        
      v7_relativeSplatPath: true,      
    },
  }
);
