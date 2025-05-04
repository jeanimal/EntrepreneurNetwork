import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    login(); // This will redirect to /api/login
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold text-2xl">
              VC
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Sign in to VentureConnect</CardTitle>
          <CardDescription className="text-center">
            Sign in with your Replit account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin} 
            className="w-full py-6 text-lg"
          >
            Sign in with Replit
          </Button>
          <p className="text-center text-sm text-gray-500 mt-4">
            You'll be redirected to Replit to complete the authentication process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
