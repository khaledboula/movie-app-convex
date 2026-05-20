import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const AUTH_KEY = "cv_user_id";

type AuthContextType = {
  userId: Id<"users"> | null;
  user: any;
  isLoading: boolean;
  login: (userId: Id<"users">) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const deleteMutation = useMutation(api.users.deleteAccount);

  const user = useQuery(api.users.current, { userId: userId ?? null });

  useEffect(() => {
    async function loadStorage() {
      try {
        let storedId;
        if (typeof (globalThis as any).window !== "undefined") {
          storedId = (globalThis as any).localStorage.getItem(AUTH_KEY);
        } else {
          storedId = await SecureStore.getItemAsync(AUTH_KEY);
        }
        if (storedId) {
          setUserId(storedId as Id<"users">);
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadStorage();
  }, []);

  const login = async (newId: Id<"users">) => {
    setUserId(newId);
    if (typeof (globalThis as any).window !== "undefined") {
      (globalThis as any).localStorage.setItem(AUTH_KEY, newId);
    } else {
      await SecureStore.setItemAsync(AUTH_KEY, newId);
    }
  };

  const logout = async () => {
    setUserId(null);
    if (typeof (globalThis as any).window !== "undefined") {
      (globalThis as any).localStorage.removeItem(AUTH_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_KEY);
    }
  };

  const deleteAccount = async () => {
    if (userId) {
      await deleteMutation({ userId });
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ userId, user, isLoading: !isLoaded, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
