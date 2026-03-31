import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "studentPortalAuth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: "", user: null };
  });

  const saveAuth = (payload) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  };

  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: "", user: null });
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const payload = { token: response.data.token, user: response.data.user };
    saveAuth(payload);
    return payload.user;
  };

  const signup = async (data) => {
    const response = await api.post("/auth/register", data);
    const payload = { token: response.data.token, user: response.data.user };
    saveAuth(payload);
    return payload.user;
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      login,
      signup,
      logout: clearAuth,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
