import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeGroup: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://192.168.1.82:5000";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔹 Check both storages on load
  useEffect(() => {
    const validateToken = async () => {
      try {
        const savedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        const savedToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (savedUser && savedToken) {
          const response = await fetch(`${API_BASE_URL}/api/validate-token`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (response.ok) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("Error validating token:", err);
        logout();
      }
    };

    validateToken();
  }, []);

  // 🔹 Login → store only in chosen storage
  const login = useCallback(
    (user: User, token: string, rememberMe: boolean) => {
      setUser(user);
      setToken(token);

      // Clear both storages first
      localStorage.clear();
      sessionStorage.clear();

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);
      }

      navigate("/dashboard");
    },
    [navigate]
  );

  // 🔹 Logout clears everything
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }, [navigate]);

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
