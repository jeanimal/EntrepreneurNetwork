import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Network from "./pages/Network";
import Projects from "./pages/Projects";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { DebugAuthState } from "./utils/debug";

function AuthenticatedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to the Replit Auth login
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          
          {/* Auth routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Protected routes */}
          <Route path="/network">
            <AuthenticatedRoute component={Network} path="/network" />
          </Route>
          <Route path="/projects">
            <AuthenticatedRoute component={Projects} path="/projects" />
          </Route>
          <Route path="/messages">
            <AuthenticatedRoute component={Messages} path="/messages" />
          </Route>
          <Route path="/profile/:id">
            {(params) => <AuthenticatedRoute component={Profile} path={`/profile/${params.id}`} />}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      {/* Add debug component in development */}
      {process.env.NODE_ENV !== 'production' && <DebugAuthState />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
