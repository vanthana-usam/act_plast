// import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role?: string;
//   employeeGroup?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (user: User, token: string, rememberMe: boolean) => void;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const EXPIRY_DAYS = 15; // 15 days remember-me session

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Hydrate auth state on app load
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
//     const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
//     const expiry = localStorage.getItem("expiry") || sessionStorage.getItem("expiry");``

//     if (storedUser && storedToken && expiry) {
//       const now = new Date().getTime();
//       if (now < Number(expiry)) {
//         setUser(JSON.parse(storedUser));
//         setToken(storedToken);
//       } else {
//         logout();
//       }
//     }
//     setLoading(false);
//   }, []);

//   // 🔹 Login
//   const login = (user: User, token: string, rememberMe: boolean) => {
//     setUser(user);
//     setToken(token);

//     // Clear old storage
//     localStorage.clear();
//     sessionStorage.clear();

//     const expiryTime = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 15 days

//     if (rememberMe) {
//       localStorage.setItem("user", JSON.stringify(user));
//       localStorage.setItem("token", token);
//       localStorage.setItem("expiry", expiryTime.toString());
//     } else {
//       sessionStorage.setItem("user", JSON.stringify(user));
//       sessionStorage.setItem("token", token);
//       sessionStorage.setItem("expiry", expiryTime.toString());
//     }
//   };

//   // 🔹 Logout
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.clear();
//     sessionStorage.clear();
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };



// AUTHCONTEXT UPDATED 

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  employeeGroup?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string, rememberMe: boolean) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EXPIRY_DAYS = 15; // 15 days remember-me session

// Storage keys
const USER_KEY = "user";
const TOKEN_KEY = "token";
const EXPIRY_KEY = "expiry";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearStorage = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
  };

  // Hydrate auth state on app load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY) || sessionStorage.getItem(EXPIRY_KEY);

    if (storedUser && storedToken && expiry) {
      const now = new Date().getTime();
      if (now < Number(expiry)) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = (user: User, token: string, rememberMe: boolean) => {
    setUser(user);
    setToken(token);

    clearStorage();

    const expiryTime = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (rememberMe) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    clearStorage();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
