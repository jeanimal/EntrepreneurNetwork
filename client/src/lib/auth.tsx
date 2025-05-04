import { createContext, useContext, ReactNode } from "react";
import { User } from "@shared/schema";
import { queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  const { 
    data: user, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // For debugging
  if (error) {
    console.error("Failed to fetch user:", error);
  }

  const login = () => {
    // Replit Auth uses a redirect flow, so we just redirect to the login endpoint
    window.location.href = "/api/login";
  };

  const logout = () => {
    // Replit Auth uses a redirect flow, so we just redirect to the logout endpoint
    window.location.href = "/api/logout";
    
    // Clear query cache
    queryClient.clear();
    
    toast({
      title: "Logged out successfully",
    });
  };

  // Handle the case where user might be undefined
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
