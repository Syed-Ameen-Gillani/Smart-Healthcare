// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";
import { clearAccessToken, restoreAccessToken } from "../utils/runtime";


const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      console.info("[session] Auth state cleared after an unauthorized response");
      setEmail("");
      setUser(null);
      setLoggedIn(false);
    };

    window.addEventListener("smarthealth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("smarthealth:session-expired", handleSessionExpired);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const restored = await restoreAccessToken();
      if (restored) {
        console.info("[session] Validating restored native session");
      }
      const response = await authAPI.checkAuth();
      
      if (response.success) {
        console.info("[session] Session validation succeeded");
        setLoggedIn(true);
        setUser(response.data?.user);
        setEmail(response.data?.user?.email || "");
      } else {
        clearAuth();
      }
    } catch (error) {
      console.info("[session] No valid session available");
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    const userEmail = userData?.email || userData;
    setEmail(userEmail);
    setUser(userData);
    setLoggedIn(true);
    console.info("[session] User interface marked as signed in");
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      console.info("[session] User signed out");
    }
  };

  const clearAuth = () => {
    clearAccessToken();
    setEmail("");
    setUser(null);
    setLoggedIn(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="smart-health-splash" role="status" aria-label="Starting Smart Health">
        <div className="smart-health-splash__brand">
          <img src="/heart-beat.png" alt="" className="smart-health-splash__logo" />
          <h1>Smart Health</h1>
          <p>Care decisions, made clearer.</p>
        </div>
        <div className="smart-health-splash__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ loggedIn, email, user, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

