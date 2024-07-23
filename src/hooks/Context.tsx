import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import axios from "axios";

interface UserData {
  username: string;
  id: number;
}

interface AuthContextType {
  token: string | null;
  user: UserData | null;
  setTokenAndUser: (token: string, userData: UserData) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [user, setUserState] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setTokenState(savedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const setTokenAndUser = (token: string, userData: UserData) => {
    setTokenState(token);
    setUserState(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const clearAuth = () => {
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return <AuthContext.Provider value={{ token, user, setTokenAndUser, clearAuth }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
